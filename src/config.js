require('dotenv').config({path: __dirname + '/.env'});

module.exports = {
    ssl: {
        cert: '/etc/letsencrypt/live/easyland.site/fullchain.pem',
        key: '/etc/letsencrypt/live/easyland.site/privkey.pem',
        passphrase: ''
    },
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
    email: {
        mailgun: {
            domain: 'easyland.site',
            apiKey: '3702fbb898a3fc05bc446587be558c05-f45b080f-7afd47e8',
            host: 'api.eu.mailgun.net'
        }
    },
    OAuth: {
        defaultPassword: '283yc4237yd4h2t374v72fb902jjgf8934jhg75g45',
        VK: {
            clientID:     '7279929',
            clientSecret: 'Ou322Ug11NGFCSBdqHa6',
            callbackURL:  'https://easyland.site:8080/oauth/vkontakte/callback'
            //https://oauth.vk.com/authorize?client_id=7279929&display=page&redirect_uri=http://easyland.site:8080/oauth/vkontakte/callback&scope=email&response_type=token&v=5.59
        }
    }
}
