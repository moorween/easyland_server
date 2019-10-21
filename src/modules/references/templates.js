import express from 'express';
import {sequelize, db} from '../../lib/db';
import fs from 'fs';
import extract from 'extract-zip';
import templateWalkSync from '../../lib/walkSync';
import path from 'path';
import {getScreenshot} from "../../lib/templateProcessor";

const router = express.Router();

router.get('/', async (req, res) => {
    const templates = await db.templates
        .scope(['active', 'defaultScope', 'noFiles'])
        .findAll();

    res.send(templates);
});

router.get('/trash', async (req, res) => {
    const templates = await db.templates
        .scope('deleted')
        .findAll();

    res.send(templates);
});

router.get('/:id', async (req, res) => {
    const template = await db.templates
        .findByPk(req.params.id);

    res.send(template);
});

router.post('/', async (req, res) => {
    try {
        const file = Object.values(req.files)[0];
        const dirName = path.parse(file.name).name;
        const templateDir = `${process.env.PWD}/templates/${dirName}`;
        fs.copyFileSync(file.path, `templates/${file.name}`);

        await new Promise((resolve, reject) => {
            extract(`templates/${file.name}`, {dir: templateDir}, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })

        const walkResult = templateWalkSync(templateDir);
        const fileList = walkResult.fileList;

        if (!fileList.length) throw 'no template files found';

        req.body.files = fileList;
        req.body.indexFile = walkResult.indexFile;
        req.body.templatePath = `${dirName}/${walkResult.correctionPath}`;

        const template = await db.templates.create(req.body);
        await template.assignCategories(req.body.categories);

        getScreenshot(dirName, `${walkResult.correctionPath}/${walkResult.indexFile}`).then(res => {
            template.update({
                screenshot: res
            });
        }).catch(() => {
        });

        res.json({status: true, template: await db.templates.findByPk(template.id)});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const template = await db.templates.findByPk(req.params.id);

        if (!template) {
            res.status(404).json({error: 'template not found'});
            return false;
        }

        if (template.deletedAt) {
            res.status(500).json({error: 'template was deleted'});
            return false;
        }

        await template.update(req.body);
        await template.assignCategories(req.body.categories);

        res.json({status: true, template: template.reload()});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.delete('/:id', async (req, res) => {
    const template = await db.templates.findByPk(req.params.id);

    if (!template) {
        res.status(404).json({error: 'template not found'});
    }

    try {
        await template.update({deletedAt: sequelize.fn('NOW'), deletedBy: req.user.id})
        await db.templates_categories.destroy({
            where: {
                templateId: template.id
            }
        });

        res.json({status: true});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err});
    }
})

router.put('/restore/:id', async (req, res) => {
    const template = await db.templates
        .scope('deleted')
        .findByPk(req.params.id);

    if (!template) {
        res.status(404).json({error: 'template not found'});
        return false;
    }
    await template.update({deletedAt: null})

    res.json({status: true});
})

export default router;
