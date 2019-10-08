import bcrypt from 'bcryptjs';
import config from '../config';
import express from 'express';
import {db} from '../lib/db';
const auth = express.Router();

auth.post('/sign-in', async (req, res) => {
    const hash = bcrypt.hashSync(req.body.password);
    const user = await db.users.findOne({
        where: {
            login: req.body.login
        }
    });

    if (!user || !user.validPassword(hash)) {
        res.abort(401);
    }

    console.log(user);

    res.send(user);
});

export default auth;
