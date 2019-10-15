import express from 'express';
import {sequelize, db} from '../lib/db';

const router = express.Router();

router.get('/', async (req, res) => {
    const questions = await db.vk_bot_questions
        .findAll();
    res.send(questions);
});

router.post('/', async (req, res) => {
    try {
        const flow = await db.vk_bot_questions.create(req.body);
        res.json(flow);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const question = await db.vk_bot_questions.findByPk(req.params.id);

        if (!question) {
            res.status(404).json({error: 'question not found'});
            return false;
        }

        if (question.deletedAt) {
            res.status(500).json({error: 'question was deleted'});
            return false;
        }

        await question.update(req.body);

        res.json({status: true, question});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.delete('/:id', async (req, res) => {
    const question = await db.vk_bot_questions.findByPk(req.params.id);

    if (!question) {
        res.status(404).json({error: 'question not found'});
    }
    await question.update({deletedAt: sequelize.fn('NOW'), deletedBy: req.user.id})

    res.json({status: true});
})

// router.put('/restore/:id', async (req, res) => {
//     const quest = await db.clients
//         .scope('deleted')
//         .findByPk(req.params.id);
//
//     if (!project) {
//         res.status(404).json({error: 'client not found'});
//         return false;
//     }
//     await project.update({deletedAt: null})
//
//     res.json({status: true});
// })

export default router;
