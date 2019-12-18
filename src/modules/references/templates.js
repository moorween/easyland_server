import express from 'express';
import {sequelize, db} from '../../lib/db';
import fs from 'fs';
import extract from 'extract-zip';
import templateWalkSync from '../../lib/walkSync';
import path from 'path';
import {getScreenshot} from "../../lib/templateProcessor";
import slugify from "slugify";
import {exec, execSync} from 'child_process';
import gitlog from 'gitlog';
import {templatesPath} from '../../config';

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

router.get('/file/:id*', async (req, res) => {
    const template = await db.templates
        .findByPk(req.params.id);

    if (!template) {
        res.status(404).json({error: 'template not found'});
        return false;
    }

    const fileName = `${templatesPath}/${template.templatePath}/${req.params[0]}`;

    if (!fs.existsSync(fileName)) {
        res.status(404).json({error: 'file not found'});
        return false;
    }

    const content = fs.readFileSync(fileName, 'utf8');

    res.send({content: content.toString()});
});

router.put('/file/:id*', async (req, res) => {
    const template = await db.templates
        .findByPk(req.params.id);

    if (!template) {
        res.status(404).json({error: 'template not found'});
        return false;
    }

    const templatePath = `${templatesPath}/${template.templatePath}`;
    const fileName = `${templatePath}/${req.params[0]}`;

    const commitMessage = `${req.user.login} - ручонками кривыми чота ковырял`;

    if (!fs.existsSync(fileName)) {
        res.status(404).json({error: 'file not found'});
        return false;
    }

    try {
        fs.writeFileSync(fileName, req.body.content, 'utf8');

        const files2render = template.files2render || [];
        if (files2render.indexOf(req.params[0]) < 0) {
            files2render.push(req.params[0]);
            await template.update({
                files2render
            })
        }

        try {
            exec(`git commit -a -m "${commitMessage}"`, {cwd: templatePath});
        } catch (err) {
            console.log(err);
        }

        res.send({status: true});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }

});

router.get('/:id', async (req, res) => {
    const template = await db.templates
        .findByPk(req.params.id);

    if (!template) {
        res.status(404).json({error: 'template not found'});
        return false;
    }

    const options =
        {
            repo: `templates/${template.templatePath}`,
            fields:
                [
                    'hash',
                    'subject',
                    'authorDateRel'
                ]
        };

    let commits = gitlog(options).map(commit => {
        return commit.subject === 'Initial commit' ? {...commit, status: [], files: []} : commit;
    });

    res.send({...template.get(), commits});
});

router.post('/', async (req, res) => {
    try {

        const file = Object.values(req.files)[0];
        const dirName = slugify(path.parse(file.name).name);
        const templateDir = `${templatesPath}/${dirName}`;

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

        const imageFile = `${dirName}.png`;

        getScreenshot(dirName, `${walkResult.correctionPath}/${walkResult.indexFile}`, imageFile).then(res => {
        }).catch(() => {
        });

        req.body.files = fileList;
        req.body.indexFile = walkResult.indexFile;
        req.body.templatePath = `${dirName}/${walkResult.correctionPath}`;
        req.body.screenshot = imageFile;

        const template = await db.templates.create(req.body);
        await template.assignCategories(req.body.categories);

        try {
            exec(`git init; git add *; git commit -a -m "Initial commit"`, {
                cwd: `templates/${template.templatePath}`
            });
        } catch (err) {
            console.log(err);
        }

        res.json({status: true, template: await db.templates.findByPk(template.id)});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err});
    }
});

router.get('/rewalk/:id', async (req, res) => {
    try {
        const template = await db.templates.findByPk(req.params.id);

        if (!template) {
            res.status(404).json({error: 'template not found'});
            return false;
        }

        const templateDir = `${templatesPath}/${template.name}`;
        const walkResult = templateWalkSync(templateDir);

        if (!walkResult.fileList.length) throw 'no template files found';

        await template.update({
            files: walkResult.fileList,
            indexFile: walkResult.indexFile,
            templatePath: `${template.name}/${walkResult.correctionPath}`
        })

        res.json({result: walkResult});
    } catch (err) {
        console.log(err);
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

        delete req.body.files;
        delete req.body.files2render;

        await template.assignCategories(req.body.categories);
        await template.update(req.body);

        res.json({status: true, template: await template.reload()});
    } catch (err) {
        res.status(500).json({error: err});
        console.log(err);
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
