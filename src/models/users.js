/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('users', {
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
		timestamps: false
	});
};
