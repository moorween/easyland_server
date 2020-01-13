import express from 'express';
import {sequelize, db} from '../../../lib/db';

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

router.get('/:id', async (req, res) => {
    try {
        const category = await db.categories.findByPk(req.params.id);
        console.log(await category.getCategoryTemplates());
        res.json({status: true, category: await category.getCategoryTemplates()});
    } catch (err) {
    console.error(err);
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
    try {
        await category.update({deletedAt: sequelize.fn('NOW'), deletedBy: req.user.id})

        await db.templates_categories.destroy({
            where: {
                categoryId: category.id
            }
        });

        res.json({status: true});
    } catch (err) {
        console.error(err);
    }
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
