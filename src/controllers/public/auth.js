import {jwtSecret} from '../../config';
import express from 'express';
import {db} from '../../lib/db';
import jwt from 'jsonwebtoken';
import passport from "passport/lib/index";

const router = express.Router();

router.get('/vkontakte/callback',
    passport.authenticate('vkontakte', { scope: ['email']}),
    (req, res) => {
        res.send(req.user);
    }
);

router.get('/', function(req, res) {
    //Here you have an access to req.user
    res.json(req.user);
});

export default router;
