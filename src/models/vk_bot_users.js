/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('vk_bot_users', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.CHAR(255),
			allowNull: true
		},
		vk_id: {
			type: DataTypes.CHAR(128),
			allowNull: true
		},
		step: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		}
	}, {
		tableName: 'vk_bot_users',
		timestamps: false
	});
};
