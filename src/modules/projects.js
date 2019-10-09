import express from 'express';
import {sequelize, db} from '../lib/db';
import {Op} from "sequelize";

const router = express.Router();

router.get('/', async (req, res) => {
    const projects = await db.projects
        .scope('noClientId')
        .findAll({
            where: {
                deletedAt: null
            },
            include: ['client']
        });

    res.send(projects);
});

router.get('/trash', async (req, res) => {
    const projects = await db.projects.findAll({
        where: {
            deletedAt: {
                [Op.ne]: null
            }
        }
    });

    res.send(projects.get({plain: true}));
});

router.post('/', async (req, res) => {
    try {
        const project = await db.projects.create(req.body);
        res.json(project.get({plain: true}));
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const project = await db.projects.findByPk(req.params.id);

        if (!project) {
            res.status(404).json({error: 'project not found'});
            return false;
        }
        if (project.deletedAt) {
            res.status(500).json({error: 'project was deleted'});
            return false;
        }

        await project.update(req.body);

        const result = {...project.get({plain: true}), client: await project.getClient()};
        delete result.clientId;
        res.json({status: true, project: result});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

router.delete('/:id', async (req, res) => {
    const project = await db.projects.findByPk(req.params.id);

    if (!project) {
        res.status(404).json({error: 'project not found'});
    }
    await project.update({deletedAt: sequelize.fn('NOW'), deletedBy: req.user.id})

    res.json({status: true});
})

export default router;
