import express from 'express';
import {sequelize, db} from '../../lib/db';

const router = express.Router();

router.all('/', async (req, res) => {
    res.status(404).json({advice: 'please define reference type'});
})

router.get('/:type', async (req, res) => {

    const refs = await db.render_references
        .scope('active')
        .findAll({
            where: {
                type: req.params.type
            }
        });

    res.send(refs);
});

router.get('/:type/trash', async (req, res) => {
    const refs = await db.render_references
        .scope('deleted')
        .findAll({
            where: {
                type: req.params.type
            }
        });

    res.send(refs);
});

router.post('/:type', async (req, res) => {
    try {
        const ref = await db.render_references.create({...req.body, type: req.params.type});

        res.json({status: true, data: await ref.reload()});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

router.put('/:type/:id', async (req, res) => {
    try {
        const type = req.params.type;
        const ref = await db.render_references
            .findOne({
                where: {
                    id: req.params.id,
                    type: req.params.type
                }
            });

        if (!ref) {
            res.status(404).json({error: `${type} not found`});
            return false;
        }

        if (ref.deletedAt) {
            res.status(500).json({error: `${type} was deleted`});
            return false;
        }

        await ref.update({...req.body, type});

        res.json({status: true, data: await ref.reload()});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

router.delete('/:type/:id', async (req, res) => {
    const type = req.params.type;
    const ref = await db.render_references
        .findOne({
            where: {
                id: req.params.id,
                type: req.params.type
            }
        });

    if (!ref) {
        res.status(404).json({error: `${type} not found`});
        return false;
    }

    try {
        await ref.update({deletedAt: sequelize.fn('NOW'), deletedBy: req.user.id})

        res.json({status: true});
    } catch (err) {
        console.error(err);
    }
})

router.put('/:type/restore/:id', async (req, res) => {
    const type = req.params.type;
    const ref = await db.render_references
        .scope('deleted')
        .findOne({
            where: {
                id: req.params.id,
                type: req.params.type
            }
        });

    if (!ref) {
        res.status(404).json({error: `${type} not found`});
        return false;
    }

    await ref.update({deletedAt: null})

    res.json({status: true});
})

export default router;
