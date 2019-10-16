/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('projects_members', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		userId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
		},
		projectId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
		},
		role: {
			type: DataTypes.CHAR(128),
			allowNull: true
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
		tableName: 'projects_members',
		timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'projectId']
            }
        ]
	});
};
