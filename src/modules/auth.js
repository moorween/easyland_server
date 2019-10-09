import {jwtSecret} from '../config';
import express from 'express';
import {db} from '../lib/db';
import jwt from 'jsonwebtoken';
const auth = express.Router();

auth.post('/sign-in', async (req, res) => {
    let user = await db.users.findOne({
        where: {
            login: req.body.login
        }
    });

    if (!user || !user.validPassword(req.body.password)) {
        res.status(401).json({ error: 'wrong password' })
        return;
    }

    user = user.get({plain: true});
    delete user.id;
    delete user.password;

    const token = jwt.sign(user, jwtSecret);
    res.send({user, token});
});

export default auth;
