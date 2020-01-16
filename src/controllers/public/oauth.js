import {jwtSecret} from '../../config';
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from "passport/lib/index";

const router = express.Router();

router.get('/vkontakte/callback',
    (req, res, next) =>
        passport.authenticate('vkontakte', {scope: ['email']}, (err, user) => {
            if (err) {
                const resp = JSON.stringify({user: null, error: err.message});
                return res.send(`<script>window.opener.postMessage('${resp}', "*");</script>`);
            }

            const token = user.active ? jwt.sign(user, jwtSecret) : '';
            const resp = JSON.stringify({user, token});
            res.send(`<script>window.opener.postMessage('${resp}', "*");</script>`);

        })(req, res, next)
);

export default router;
