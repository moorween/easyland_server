import express from 'express';
import jwt from 'express-jwt';
import {jwtSecret} from './config'
import auth from './modules/auth';
import prot from './modules/prot';

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use('/auth', auth);
app.use('/protected', jwt({secret: jwtSecret}), prot);

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ error: 'invalid token' })
    }
});

app.listen(8080);
