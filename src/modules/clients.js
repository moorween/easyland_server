import express from 'express';
import {sequelize, db} from '../lib/db';

const router = express.Router();

router.get('/', async (req, res) => {
    const projects = await db.clients
        .scope('active')
        .findAll();

    res.send(projects);
});

router.get('/:id', async (req, res) => {
    const client = await db.clients
        .findByPk(req.params.id);

    if (!client) {
        res.status(404).json({error: 'client not found'});
        return false;
    }

    res.send(client);
});

router.get('/trash', async (req, res) => {
    const clients = await db.clients
        .scope('deleted')
        .findAll();

    res.send(clients);
});

router.post('/', async (req, res) => {
    try {
        const client = await db.clients.create(req.body);
        res.json(client);
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const client = await db.clients.findByPk(req.params.id);

        if (!client) {
            res.status(404).json({error: 'client not found'});
            return false;
        }

        if (client.deletedAt) {
            res.status(500).json({error: 'client was deleted'});
            return false;
        }

        await client.update(req.body);

        res.json({status: true, client});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.delete('/:id', async (req, res) => {
    const client = await db.clients.findByPk(req.params.id);

    if (!client) {
        res.status(404).json({error: 'client not found'});
    }
    await client.update({deletedAt: sequelize.fn('NOW'), deletedBy: req.user.id})

    res.json({status: true});
})

router.put('/restore/:id', async (req, res) => {
    const project = await db.clients
        .scope('deleted')
        .findByPk(req.params.id);

    if (!project) {
        res.status(404).json({error: 'client not found'});
        return false;
    }
    await project.update({deletedAt: null})

    res.json({status: true});
})

export default router;
