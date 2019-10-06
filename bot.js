import express from 'express';
import bodyParser from'body-parser';
import VkBot from 'node-vk-bot-api';

const app = express();
const bot = new VkBot({
    token: '9b28a8c4ceb7a888d7ac621e5d13e94a79d5892297f283257525c1dea01a6c70281889930b4f0ab60b9bc',
    confirmation: 'a19d5220',
})

bot.on((ctx) => {
    console.log(ctx);
    ctx.reply('Hello!')
})

app.use(bodyParser.json())

app.post('/', bot.webhookCallback)

app.listen(4300)
