import express from 'express';
import cors from 'cors';
import jwt from 'express-jwt';
import {jwtSecret} from './config'
import auth from './modules/auth';
import projects from './modules/projects';
import clients from './modules/clients';

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

app.use(cors());
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded());
app.use('/api/v1', router);

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ error: 'invalid token' })
    }
});

app.listen(8080);
