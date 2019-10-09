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
		password: {
			type: DataTypes.CHAR(255),
			allowNull: true
		},
		email: {
			type: DataTypes.CHAR(255),
			allowNull: true
		},
		role: {
			type: DataTypes.CHAR(128),
			allowNull: true
		}
	}, {
		tableName: 'users',
		timestamps: false,
		hooks: {
			beforeCreate: (user) => {
				user.password = bcrypt.hashSync(user.password, 10);
			}
		},
	});

	users.prototype.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    }

    return users;
};
