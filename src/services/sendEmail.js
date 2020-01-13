import mailgun from 'mailgun-js';
import {email} from '../config';
import ejs from "ejs";

export default async (to, subject, template, data) => {
    const mg = mailgun(email.mailgun);
    const templatePath = `${process.env.PWD}/src/views/email/${template}.ejs`;

    try {
        const html = await ejs.renderFile(templatePath, data, {async: true});
        mg.messages().send(
            {
                from: 'Excited User <me@samples.mailgun.org>',
                to,
                subject,
                html
            }, (error, body) => {
                console.log(error, body);
            });
    } catch (err) {
        console.log(err);
    }
}
