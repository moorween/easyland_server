/* jshint indent: 1 */

import {Op} from "sequelize";

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('projects', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		clientId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			validate: {notNull: true}
		},
		title: {
			type: DataTypes.CHAR(128),
			allowNull: false,
			validate: { notNull: true, notEmpty: true }
		},
		status: {
			type: DataTypes.CHAR(128),
			allowNull: true,
			defaultValue: 'created'
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
		tableName: 'projects',
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
            },
			withMembers: {
                include: [{
                    association: 'members',
                    as: 'items',
                    attributes: {exclude: ['password']},
                    through: {
                    	as: 'memberDetails',
						where: {deletedAt: null},
                        attributes: {exclude: ['id', 'userId', 'projectId']}
                    }
                }]
    		},
			withClient: {
                attributes: { exclude: ['clientId'] },
                include: ['client']
			}
		}
	});
};
