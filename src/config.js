require('dotenv').config({path: __dirname + '/.env'});

module.exports = {
    mysql: {
        host: process.env.HOST || 'localhost',
        port: process.env.PORT || '23306',
        database: 'easy_land',
        username: process.env.USERNAME || 'root',
        password: process.env.PASSWORD || ''
    },
    vk: {
        token: '9b28a8c4ceb7a888d7ac621e5d13e94a79d5892297f283257525c1dea01a6c70281889930b4f0ab60b9bc',
        confirmation: 'a19d5220'
    }
}
