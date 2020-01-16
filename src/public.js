import express from 'express';
import jwt from 'express-jwt';
import {jwtSecret, OAuth, ssl} from './config'
import {jwtUnprotected} from "./lib/jwtUtils";
import passport from 'passport';
import {Strategy as VKontakteStrategy} from 'passport-vkontakte';
import {db} from './lib/db';
import auth from './controllers/common/auth';
import oauth from './controllers/public/oauth';

const router = express.Router();

export default async (app) => {
    router.use(jwt({secret: jwtSecret}).unless(jwtUnprotected));
    router.use('/auth', auth);

    passport.use(new VKontakteStrategy(
        {
            ...OAuth.VK,
            scope: ['email'],
            profileFields: ['email']
        },
        (accessToken, refreshToken, params, profile, done) => {
            db.users.findOrCreate({
                where:
                    {
                        email: params.email
                    },
                defaults: {
                    login: profile.username,
                    password: OAuth.defaultPassword,
                    lastName: profile.name.familyName,
                    firstName: profile.name.givenName,
                    status: 'oauth_user'
                },
                unprotect: ['status']
            })
                .then(async ([user, created]) => {
                    if (created) {
                        user = await user.reload();
                    }

                    done(null, user.get({
                        plain: true
                    }));
                })
                .catch(done);
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    app.use('/oauth', oauth);
    app.use('/api/v1', router);

    return app;
}
