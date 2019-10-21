import express from 'express';
import cors from 'cors';
import jwt from 'express-jwt';
import bodyParser from 'body-parser';
import formData from 'express-form-data';
import os from 'os';

import {jwtSecret} from './config'
import auth from './modules/auth';
import projects from './modules/projects';
import clients from './modules/clients';
import botFlow from './modules/botFlow';
import references from './modules/references';

const app = express();
const router = express.Router();

const jwtUnprotected = (req) => {
    const unprotectedRoutes = [
        '/auth/sign-in'
    ];

    return unprotectedRoutes.indexOf(req.path) > -1;
}

router.use(jwt({secret: jwtSecret}).unless(jwtUnprotected));
router.use('/auth', auth);
router.use('/projects', projects);
router.use('/clients', clients);
router.use('/bot-flow', botFlow);
router.use('/references', references);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded());
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

app.listen(8081);
