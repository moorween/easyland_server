const sequelizeAuto = require('sequelize-auto');
const args = require('./lib/args');
const config = require('./config').mysql;

const tables = args('table') ? [args('table')] : ['vk_bot_questions'];
console.log(config);
const auto = new sequelizeAuto(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'mariadb',
    additional: {
        timestamps: false
    },
    tables
});

auto.run();
