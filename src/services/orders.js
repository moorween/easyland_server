import {db} from "../lib/db";


const createOrder = async (user, data) => {
    const template = await db.templates.random();

    const order = db.orders.create({
        botUserId: user.id,
        templateId: template.id,
        data
    });

    return order;
}

export {createOrder}