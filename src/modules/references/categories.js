import express from 'express';
import {sequelize, db} from '../../lib/db';

const router = express.Router();

router.get('/', async (req, res) => {
    const categories = await db.categories
        .scope('active')
        .findAll();

    res.send(categories);
});

router.get('/trash', async (req, res) => {
    const categories = await db.categories
        .scope('deleted')
        .findAll();

    res.send(categories);
});

router.post('/', async (req, res) => {
    try {
        const category = await db.categories.create(req.body);
        res.json({status: true, category});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const category = await db.categories.findByPk(req.params.id);

        if (!category) {
            res.status(404).json({error: 'category not found'});
            return false;
        }

        if (category.deletedAt) {
            res.status(500).json({error: 'category was deleted'});
            return false;
        }

        await category.update(req.body);

        res.json({status: true, category});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.delete('/:id', async (req, res) => {
    const category = await db.categories.findByPk(req.params.id);

    if (!category) {
        res.status(404).json({error: 'category not found'});
    }
    await category.update({deletedAt: sequelize.fn('NOW'), deletedBy: req.user.id})

    res.json({status: true});
})

router.put('/restore/:id', async (req, res) => {
    const category = await db.categories
        .scope('deleted')
        .findByPk(req.params.id);

    if (!category) {
        res.status(404).json({error: 'category not found'});
        return false;
    }
    await category.update({deletedAt: null})

    res.json({status: true});
})

export default router;
