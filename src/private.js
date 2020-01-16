import express from 'express';
import jwt from 'express-jwt';
import {jwtSecret, ssl} from './config'
import auth from './controllers/common/auth';
import users from './controllers/crm/users';
import projects from './controllers/crm/projects';
import clients from './controllers/crm/clients';
import blocks from './controllers/crm/blocks';
import botFlow from './controllers/crm/botFlow';
import references from './controllers/crm/references';

import {jwtUnprotected} from "./lib/jwtUtils";

const router = express.Router();

export default async (app) => {
    router.use(jwt({secret: jwtSecret}).unless(jwtUnprotected));
    router.use('/auth', auth);
    router.use('/users', users);
    router.use('/projects', projects);
    router.use('/clients', clients);
    router.use('/blocks', blocks);

    router.use('/bot-flow', botFlow);
    router.use('/references', references);

    app.use('/api/v1', router);

    return app;
}


