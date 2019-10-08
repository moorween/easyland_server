import express from 'express';
import jwt from 'express-jwt';
import auth from './modules/auth';

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use('/auth', auth);
app.listen(8080);
