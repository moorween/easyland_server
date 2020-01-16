import {sequelize, db} from './lib/db';
import Render from './services/render';
import {templatesPath, renderPath, OAuth} from './config';
import sendEmail from "./services/sendEmail";

const main = async () => {
    // const order = await db.orders.findOne( {order: sequelize.random()})
    // // console.log(order);
    // const render = new Render(order);
    //
    // await render.makeZip('123123');
    // console.log(await render.makeScreenshot(renderPath + '/123123.jpg'));
    db.users.findOrCreate({
        where:
            {
                email: 'wefwefwef@fgwef.cdd'
            },
        defaults: {
            login: '1',
            password: '1',
            lastName: '2',
            firstName: '3',
            status: 'asdasdasd'
        },
        unprotect: ['status']
    }).then((res) => {
        // console.log(res);
    })
}

main();
