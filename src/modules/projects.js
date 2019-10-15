import express from 'express';
import {sequelize, db} from '../lib/db';

const router = express.Router();

router.get('/', async (req, res) => {
    const projects = await db.projects
        .scope(['active', 'withClient', 'withMembers'])
        .findAll();

    res.send(projects);
});

router.get('/:id', async (req, res) => {
    const project = await db.projects
        .scope(['withClient', 'withMembers'])
        .findByPk(req.params.id);

    if (!project) {
        res.status(404).json({error: 'project not found'});
        return false;
    }

    res.send(project);
});

router.get('/trash', async (req, res) => {
    const projects = await db.projects
        .scope('deleted')
        .findAll();

    res.send(projects);
});

router.post('/', async (req, res) => {
    try {
        const project = await db.projects
        // .scope(['withClient', 'withMembers'])
            .create(req.body);

        const result = {...project.get({plain: true}), client: await project.getClient()};

        res.json({status: true, project: result});
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
        await project.assignMembers(JSON.parse(req.body.members));

        const result = {...project.get({plain: true}), client: await project.getClient(), members: await project.getMembers()};
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

router.put('/restore/:id', async (req, res) => {
    const project = await db.projects
        .scope('deleted')
        .findByPk(req.params.id);

    if (!project) {
        res.status(404).json({error: 'project not found'});
        return false;
    }

    await project.update({deletedAt: null})

    res.json({status: true});
})

export default router;
