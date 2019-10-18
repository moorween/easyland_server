import express from 'express';
import {sequelize, db} from '../lib/db';

const router = express.Router();

router.get('/', async (req, res) => {
    const projects = await db.projects
        .scope(['active', 'defaultScope'])
        .findAll();

    res.send(projects);
});

router.get('/trash', async (req, res) => {
    const projects = await db.projects
        .scope('deleted')
        .findAll();

    res.send(projects);
});

router.get('/:id', async (req, res) => {
    const project = await db.projects
        .findByPk(req.params.id);

    if (!project) {
        res.status(404).json({error: 'project not found'});
        return false;
    }

    res.send(project);
});

router.post('/', async (req, res) => {
    try {
        const project = await db.projects
            .create(req.body);

        await project.assignMembers(req.body.members);

        res.json({status: true, project: await db.projects.findByPk(project.id)});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const project = await db.projects
            .scope(['defaultScope'])
            .findByPk(req.params.id);

        if (!project) {
            res.status(404).json({error: 'project not found'});
            return false;
        }
        if (project.deletedAt) {
            res.status(500).json({error: 'project was deleted'});
            return false;
        }

        await project.update(req.body);
        await project.assignMembers(req.body.members);

        res.json({status: true, project: await project.reload()});
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

    try {
        await project.update({deletedAt: sequelize.fn('NOW'), deletedBy: req.user.id})
        await db.members.destroy({
            where: {
                projectId: project.id
            }
        });

        res.json({status: true});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
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
