import {sequelize, db} from './lib/db';
import Render from './services/render';
import {templatesPath, renderPath} from './config';
import sendEmail from "./services/sendEmail";

const main = async () => {
    // const order = await db.orders.findOne( {order: sequelize.random()})
    // // console.log(order);
    // const render = new Render(order);
    //
    // await render.makeZip('123123');
    // console.log(await render.makeScreenshot(renderPath + '/123123.jpg'));
    await sendEmail('moorween@gmail.com', 'Easy land activation', 'new-user', {code: 'wefwefwefwef'});
}

main();
