import bcrypt from 'bcryptjs';
import config from '../config';
import express from 'express';
import {db} from '../lib/db';
const auth = express.Router();

auth.post('/sign-in', async (req, res) => {
    const hash = bcrypt.hashSync(req.body.password);
    console.log(req.body.login, hash);
    const user = await db.users.findOne({
        where: {
            login: req.body.login,
            password: hash
        }
    });

    console.log(user);

    res.send(user);
});

export default auth;
