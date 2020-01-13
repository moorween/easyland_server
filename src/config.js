require('dotenv').config({path: __dirname + '/.env'});

module.exports = {
    mysql: {
        host: process.env.HOST || 'localhost',
        port: process.env.PORT || '23306',
        database: 'easy_land',
        username: 'root',
        password: process.env.PASSWORD || ''
    },
    vk: {
        token: '9b28a8c4ceb7a888d7ac621e5d13e94a79d5892297f283257525c1dea01a6c70281889930b4f0ab60b9bc',
        confirmation: 'a19d5220'
    },
    jwtSecret: 'wegfwergefvoiwhe2i3hr873rh§d76W8UEFWC23',
    puppeteerConfig() {
        return {
            ignoreHTTPSErrors: true,
            args: [
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--disable-web-sockets',
                '--disable-web-security',
                '--disable-dev-profile',
                '--ignore-certificate-errors'
            ],
            devtools: false,
            headless: true
        };
    },
    templatesPath: `${process.env.PWD}/templates/`,
    renderPath: `${process.env.PWD}/render/`,

    OAuth: {
        VK: {
            clientID:     '7279929',
            clientSecret: 'Ou322Ug11NGFCSBdqHa6',
            callbackURL:  'http://krucorp.ru:8080/api/v1/auth/vkontakte/callback'
            //https://oauth.vk.com/authorize?client_id=7279929&display=page&redirect_uri=http://krucorp.ru:8080/api/v1/auth/vkontakte/callback&scope=email&response_type=token&v=5.59
        }
    }
}
