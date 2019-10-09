import {jwtSecret} from '../config';
import express from 'express';
import {db} from '../lib/db';
import jwt from 'jsonwebtoken';

const router = express.Router();


router.get('/', (req, res) => {
    res.send(req.user);
})

export default router;
