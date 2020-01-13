import {jwtSecret} from '../../config';
import express from 'express';
import {db} from '../../lib/db';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/sign-in', async (req, res) => {
    let user = await db.users
        .scope(null)
        .findOne({
            where: {
                login: req.body.login
            }
        });

    if (!user || !user.validPassword(req.body.password)) {
        res.status(401).json({error: 'wrong password'})
        return;
    }

    user = user.get({plain: true});
    const token = jwt.sign(user, jwtSecret);

    delete user.password;
    delete user.login;
    res.send({user, token});
});

router.post('/sign-up', async (req, res) => {
    try {
        let user = await db.users.create(req.body);
        user = user.get({plain: true});

        delete user.password;
        delete user.login;

        res.json(user);
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await db.users
            .scope('withProjects', 'noPassword')
            .findByPk(req.params.id);

        if (!user) {
            res.status(404).json({error: 'user not found'});
            return false;
        }

        res.json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const user = await db.users.findByPk(req.params.id);

        if (!user) {
            res.status(404).json({error: 'user not found'});
            return false;
        }

        if (user.id !== req.user.id) {
            res.status(401).json({error: 'user owner is wrong'});
            return false;
        }

        await user.update(req.body);

        res.json({status: true, user});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.get('/', async (req, res) => {
    const users = await db.users.findAll();
    res.json(users);
})

export default router;
