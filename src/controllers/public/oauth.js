import express from 'express';
import passport from "passport/lib/index";

const router = express.Router();

router.get('/vkontakte/callback',
    (req, res, next) =>
        passport.authenticate('vkontakte', {scope: ['email']}, async (err, user) => {
            if (err) {
                const resp = JSON.stringify({user: null, error: err.message});
                return res.send(`<script>window.opener.postMessage('${resp}', "*");</script>`);
            }
            if (user.active) {
                await user.attachGuestOrders(req.query.state);
            }

            const resp = JSON.stringify({user, token: await user.jwtToken()});
            res.send(`<script>window.opener.postMessage('${resp}', "*");</script>`);

        })(req, res, next)
);

export default router;
