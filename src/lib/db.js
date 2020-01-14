const Sequelize = require('sequelize');
const {mysql} = require('../config');

const sequelize = new Sequelize(mysql.database, mysql.username, mysql.password, {
    host: mysql.host,
    port: mysql.port,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        // timestamps: false
    },
    defaultHidden: [
        'deletedAt',
        'deletedBy'
    ],
    defaultProtected: [
        'deletedAt',
        'deletedBy'
    ],
    operatorsAliases: {
        $in: Sequelize.Op.in,
        $like: Sequelize.Op.like
    }
});

module.exports = {
    sequelize,
    db: require('./models')(sequelize)
};
