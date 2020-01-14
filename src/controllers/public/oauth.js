import {jwtSecret} from '../../config';
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from "passport/lib/index";

const router = express.Router();

router.get('/vkontakte/callback',
    passport.authenticate('vkontakte', { scope: ['email']}),
    (req, res) => {
        const token = req.user.active ? jwt.sign(req.user, jwtSecret) : '';
        res.send({user: req.user, token});
    }
);

export default router;
