/* jshint indent: 1 */

import {Op} from "sequelize";

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('clients', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.CHAR(128),
			allowNull: false,
			validate: { notNull: true, notEmpty: true }
		},
		email: {
			type: DataTypes.TEXT,
			allowNull: false,
			validate: { isEmail: true }
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
		tableName: 'clients',
		timestamps: true,
        scopes: {
            active: {
                where: {
                    deletedAt: null
                }
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
