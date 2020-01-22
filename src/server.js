import crm from './private';
import api from './public';
import fs from "fs";
import {ssl} from "./config";
import https from "https";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import formData from "express-form-data";
import os from "os";
import passport from "passport/lib/index";

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(formData.parse({
    uploadDir: os.tmpdir(),
    autoClean: true
}));
app.use(passport.initialize());

app.use('/static/screenshots', express.static('templates/screenshots'));

const runApp = port => app => {

    app.use((err, req, res, next) => {
        console.log(err);
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({error: 'invalid token'})
        }
    });

    if (fs.existsSync(ssl.cert) && fs.existsSync(ssl.key)) {
        https.createServer(
            {
                key: fs.readFileSync(ssl.key),
                cert: fs.readFileSync(ssl.cert),
                passphrase: ssl.passphrase
            },
            app).listen(port);
        console.log('SSL enabled');
    } else {
        app.listen(port);
    }
}

crm(app).then(runApp(8008));
api(app).then(runApp(8080));
