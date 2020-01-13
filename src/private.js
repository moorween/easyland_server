import express from 'express';
import cors from 'cors';
import jwt from 'express-jwt';
import bodyParser from 'body-parser';
import formData from 'express-form-data';
import os from 'os';

import {jwtSecret} from './config'
import auth from './controllers/common/auth';
import users from './controllers/crm/users';
import projects from './controllers/crm/projects';
import clients from './controllers/crm/clients';
import blocks from './controllers/crm/blocks';
import botFlow from './controllers/crm/botFlow';
import references from './controllers/crm/references';

import {jwtUnprotected} from "./lib/jwtUtils";

const app = express();
const router = express.Router();

export default async () => {
    router.use(jwt({secret: jwtSecret}).unless(jwtUnprotected));
    router.use('/auth', auth);
    router.use('/users', users);
    router.use('/projects', projects);
    router.use('/clients', clients);
    router.use('/blocks', blocks);

    router.use('/bot-flow', botFlow);
    router.use('/references', references);

    app.use(cors());
    app.use(express.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(formData.parse({
        uploadDir: os.tmpdir(),
        autoClean: true
    }));

    app.use('/api/v1', router);
    app.use('/static/screenshots', express.static('templates/screenshots'));
    app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({ error: 'invalid token' })
        }
    });

    app.listen(8008);
}


