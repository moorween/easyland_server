/* jshint indent: 1 */
const bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
	const users = sequelize.define('users', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		firstName: {
			type: DataTypes.CHAR(128),
			allowNull: true
		},
		lastName: {
			type: DataTypes.CHAR(128),
			allowNull: true
		},
		login: {
			type: DataTypes.CHAR(128),
			allowNull: false,
			validate: {notNull: true, notEmpty: true}
		},
		password: {
			type: DataTypes.CHAR(255),
			allowNull: false,
			validate: {notNull: true, notEmpty: true},
			set(password) {
				this.setDataValue('password', bcrypt.hashSync(password, 10));
			}
		},
		email: {
			type: DataTypes.CHAR(255),
			allowNull: true,
			validate: {isEmail: true}
		},
		role: {
			type: DataTypes.CHAR(128),
			allowNull: true
		}
	}, {
		tableName: 'users',
		timestamps: false,
		scopes: {
			noPassword: {
				attributes: { exclude: ['password'] },
			}
		}
	});

	users.prototype.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    }

    return users;
};
