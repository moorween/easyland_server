/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('vk_bot_questions', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		step: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		text: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		variants: {
			type: DataTypes.TEXT,
			allowNull: true,
            get() {
                return JSON.parse(this.getDataValue('variants'))
            }
		},
		sticker: {
			type: DataTypes.STRING(100),
			allowNull: true
		},
		status: {
			type: DataTypes.STRING(100),
			allowNull: true
		},
		condition: {
			type: DataTypes.STRING(100),
			allowNull: true
		},
		delay: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		}
	}, {
		tableName: 'vk_bot_questions',
		timestamps: false
	});
};
