import express from 'express';
import {sequelize, db} from '../lib/db';

const router = express.Router();

router.get('/', async (req, res) => {
    const blocks = await db.blocks
        .scope(['active', 'defaultScope'])
        .findAll();

    res.send(blocks);
});

router.get('/trash', async (req, res) => {
    const blocks = await db.blocks
        .scope('deleted')
        .findAll();

    res.send(blocks);
});

router.get('/:id', async (req, res) => {
    const block = await db.blocks
        .findByPk(req.params.id);

    if (!block) {
        res.status(404).json({error: 'block not found'});
        return false;
    }

    res.send(block);
});

router.post('/', async (req, res) => {
    try {
        const block = await db.blocks
            .create(req.body);

        await block.assignCategories(req.body.categories);

        res.json({status: true, block: await db.blocks.findByPk(block.id)});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const block = await db.blocks
            .scope(['defaultScope'])
            .findByPk(req.params.id);

        if (!block) {
            res.status(404).json({error: 'block not found'});
            return false;
        }
        if (block.deletedAt) {
            res.status(500).json({error: 'block was deleted'});
            return false;
        }

        await block.assignCategories(req.body.categories);
        await block.update(req.body);

        res.json({status: true, block: await block.reload()});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

router.delete('/:id', async (req, res) => {
    const block = await db.blocks.findByPk(req.params.id);

    if (!block) {
        res.status(404).json({error: 'block not found'});
    }

    try {
        await block.update({deletedAt: sequelize.fn('NOW'), deletedBy: req.user.id})
        await db.categories.destroy({
            where: {
                blockId: block.id
            }
        });

        res.json({status: true});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
})

router.put('/restore/:id', async (req, res) => {
    const block = await db.blocks
        .scope('deleted')
        .findByPk(req.params.id);

    if (!block) {
        res.status(404).json({error: 'block not found'});
        return false;
    }

    await block.update({deletedAt: null})

    res.json({status: true});
})

export default router;
