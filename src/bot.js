import express from 'express';
import bodyParser from 'body-parser';
import delay from 'await-delay';
import VkBot from 'node-vk-bot-api';
import Markup from 'node-vk-bot-api/lib/markup';
import config from './config';
import {db} from './lib/db';

const app = express();
const bot = new VkBot(config.vk)

let dialogFlow = {};

const requiredMessageText = 'Пожалуйста, дайте ответ на предыдущий вопрос!';
const finishMessageText = 'Вопросов больше не имею.';
const multiselectStopText = 'Хватит';

const processEvent = async (ctx) => {
    const message = ctx.message.body;
    const [user] = await db.vk_bot_users.findOrCreate({
            where: {
                vk_id: ctx.message.user_id,
            }
        }
    );

    if (!dialogFlow[user.vk_id]) {
        console.log('NEW FLOW', user.vk_id);
        dialogFlow[user.vk_id] = {
            step: 0,
            answers: {}
        }
    }

    const flow = dialogFlow[user.vk_id];

    const replyKeyboard = (question, data) => {

        const selected = (flow.answers[question.id] || []).map(val => val.text);
        const text = selected.length ? `${question.text} (${selected.join(', ')})` : question.text;

        let keyboard = [
            ...data.filter(val => selected.indexOf(val) < 0)
        ]

        if (question.multiselect) {
            keyboard.unshift(Markup.button(multiselectStopText, 'positive'))
        }

        ctx.reply(text, null, Markup
            .keyboard(keyboard, {columns: 2})
            .oneTime()
        )
    }

    const completeStep = (lastQuestion) => {
        dialogFlow[user.vk_id] = {
            ...flow,
            step: lastQuestion.step + 1,
            question: lastQuestion
        }
    }

    const updateLastQuestion = (lastQuestion) => {
        dialogFlow[user.vk_id].question = lastQuestion;
    }

    const nextQuestion = async () => {
        const flow = dialogFlow[user.vk_id];

        const nextQuestions = await db.vk_bot_questions
            .scope('active')
            .findAll({
                where: {
                    step: flow.step
                }
            }).filter((question) => {
                if (!question.condition) return true;
                const [questionId, answer] = question.condition.split('=');
                return ((flow.answers[questionId] || []).find(val => val.variantId === answer));
            })

        if (!nextQuestions.length) {
            ctx.reply(finishMessageText);

            db.orders.create({
                botUserId: user.id,
                data: flow.answers
            });

            dialogFlow[user.vk_id] = null;
            return;
        }

        let lastQuestion;
        try {
            for (const question of nextQuestions) {
                if (question.delay) {
                    await delay(question.delay);
                }

                switch (question.type) {
                    case 'variants':
                        replyKeyboard(question, question.variants.map(val => val.variant))
                        break;
                    case 'reference':
                        const referenceData = await db[question.reference].scope('active').findAll();
                        replyKeyboard(question, referenceData.map(val => val.title.substr(0, 40)));
                        break;
                    case 'noAnswer':
                        ctx.reply(question.text);
                        await delay(1000);

                        completeStep(question);
                        await nextQuestion();
                        return false;
                    default:
                        ctx.reply(question.text);
                }

                lastQuestion = question;
            }
        } catch (err) {
            console.error(err);
        }

        if (!lastQuestion.multiselect) {
            completeStep(lastQuestion);
        } else {
            updateLastQuestion(lastQuestion);
        }
    }

    if (message && flow.question) {
        let variantId = null;

        if (flow.question.multiselect) {
            if (message === multiselectStopText) {
                completeStep(flow.question);
                await nextQuestion();
                return false;
            }
        }

        switch (flow.question.type) {
            case 'variants':
                variantId = flow.question.variants.reduce((result, val) => {
                    if (val.variant === message) {
                    }
                    result = val.variant === message ? val.id : result;
                    return result;
                }, null);

                break;
            case 'reference':
                break;
        }

        dialogFlow[user.vk_id].answers[flow.question.id] = [
            ...(dialogFlow[user.vk_id].answers[flow.question.id] || []),
            {
                type: flow.question.type,
                text: message,
                variantId
            }
        ];


        if (flow.question.multiselect) {
            await nextQuestion();
            return false;
        }

    } else {
        if (flow.question && flow.question.required) {
            ctx.reply(requiredMessageText);
            return false;
        }
    }

    await nextQuestion();
}

bot.event('group_join', processEvent)
bot.on(processEvent);

app.use(bodyParser.json())
app.post('/', bot.webhookCallback)
app.listen(4300)
