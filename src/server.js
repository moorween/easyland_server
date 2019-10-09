import express from 'express';
import jwt from 'express-jwt';
import {jwtSecret} from './config'
import auth from './modules/auth';
import projects from './modules/projects';
import clients from './modules/clients';

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use(jwt({secret: jwtSecret}).unless({path: ['/auth/sign-in']}));

app.use('/auth', auth);
app.use('/projects', projects);
app.use('/clients', clients);

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ error: 'invalid token' })
    }
});

app.listen(8080);
