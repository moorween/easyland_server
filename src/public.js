import express from 'express';
import cors from 'cors';
import jwt from 'express-jwt';
import bodyParser from 'body-parser';
import formData from 'express-form-data';
import os from 'os';

import {jwtSecret, OAuth} from './config'
import {jwtUnprotected} from "./lib/jwtUtils";

import passport from 'passport';
import {Strategy as VKontakteStrategy} from 'passport-vkontakte';

import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import {db} from './lib/db';
import auth from './controllers/common/auth';
import oauth from './controllers/public/oauth';

const app = express();
const router = express.Router();

export default async () => {
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
                    password: 'empty',
                    lastName: profile.name.familyName,
                    firstName: profile.name.givenName,
                    role: 'user'
                }
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

    app.use(cors());
    app.use(express.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(formData.parse({
        uploadDir: os.tmpdir(),
        autoClean: true
    }));

    app.use(passport.initialize());

    app.use('/oauth', oauth);
    app.use('/api/v1', router);

    app.use('/static/screenshots', express.static('templates/screenshots'));
    app.use((err, req, res, next) => {
        console.log(err);
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({error: 'invalid token'})
        }
    });

    app.listen(8080);
}
