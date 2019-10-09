/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('projects', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		title: {
			type: DataTypes.CHAR(128),
			allowNull: true
		},
		members: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		status: {
			type: DataTypes.CHAR(128),
			allowNull: true
		},
		createdAt: {
			type: DataTypes.CHAR(255),
			allowNull: true
		},
		updatedAt: {
			type: DataTypes.CHAR(255),
			allowNull: true
		}
	}, {
		tableName: 'projects',
		timestamps: false
	});
};
