import config from './config';
import {sequelize, db} from './lib/db';
import render from './services/render';

const main = async () => {
    const order = await db.orders.findOne( {order: sequelize.random()})
    console.log(order);
    await render(order);

}

main();