/* jshint indent: 1 */

const Op = require('sequelize').Op;

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('clients', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		botUserId: {
			type: DataTypes.CHAR(128),
			allowNull: false
		},
		data: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
            get() {
                return JSON.parse(this.getDataValue('data') || '{}')
            },
            set(value) {
                this.setDataValue('data', JSON.stringify(value))
            }
		},
		status: {
			type: DataTypes.CHAR(128),
			allowNull: true,
			defaultValue: 'new'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		deletedAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		deletedBy: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		}
	}, {
		tableName: 'orders',
		timestamps: true,
        scopes: {
            active: {
                where: {
                    deletedAt: null
                },
                attributes: {exclude: ['deletedAt', 'deletedBy']}
            },
            deleted: {
                where: {
                    deletedAt: {
                        [Op.ne]: null
                    }
                }
            }
        }
	});
};
