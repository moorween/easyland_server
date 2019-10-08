import express from 'express';
import bodyParser from 'body-parser';
import VkBot from 'node-vk-bot-api';
import Markup from 'node-vk-bot-api/lib/markup';
import config from './config';
import {db} from './lib/db';

const app = express();
const bot = new VkBot(config.vk)

let dialogFlow = {};

const processEvent = async(ctx) => {
    const message = ctx.message.body;
    const [user] = await db.vk_bot_users.findOrCreate({
            where: {
                vk_id: ctx.message.user_id,
            }
        }
    );

    if (!dialogFlow[user.vk_id]) {
        console.log('NEW FLOW');
        dialogFlow[user.vk_id] = {
            step: 0,
            answers: {}
        }
    }

    const flow = dialogFlow[user.vk_id];

    if (message && flow.question) {
        let variantId = null;
        if (flow.question.variants) {
            variantId = flow.question.variants.reduce((result, val) => {
                if (val.variant === message) {
                }
                result = val.variant === message ? val.id : result;
                return result;
            }, null)
        }

        dialogFlow[user.vk_id].answers[flow.question.id] = {
            text: message,
            variantId
        };
    }

    const nextQuestions = await db.vk_bot_questions.findAll({
        where: {
            step: flow.step
        }
    }).filter((question) => {
        if (!question.condition) return true;
        const [questionId, answer] = question.condition.split('=');
        return flow.answers[questionId].variantId == answer;
    })

    if (!nextQuestions.length) {
        ctx.reply('Вопросов больше не имею');
        console.log(dialogFlow[user.vk_id].answers);
        dialogFlow[user.vk_id] = null;
        return;
    }

    let lastQuestion;
    for (const question of nextQuestions) {
        if (question.variants) {
            ctx.reply(question.text, null, Markup
                .keyboard(question.variants.map(val => val.variant))
                .oneTime()
            )
        } else {
            ctx.reply(question.text);
        }
        lastQuestion = question;
    }

    dialogFlow[user.vk_id] = {
        ...flow,
        step: flow.step + 1,
        question: lastQuestion
    }
}

bot.event('group_join', processEvent)
bot.on(processEvent);

app.use(bodyParser.json())
app.post('/', bot.webhookCallback)
app.listen(4300)
