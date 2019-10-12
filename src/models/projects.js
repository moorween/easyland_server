/* jshint indent: 1 */

const Op = require('sequelize').Op;

module.exports = function(sequelize, DataTypes) {
	const projects = sequelize.define('projects', {
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
			validate: { notNull: true, notEmpty: true },
			unique: true
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
		},

	});

    projects.prototype.assignMembers = async function (members) {
        for (const member of members) {

        	const user = await sequelize.models.users.findByPk(member.id);
            if (!user) return false;

        	switch (member.action) {
				case 'assign':
					this.addMember(user, {through: {role: (member.memberDetails || {}).role}});
					break;
				case 'delete':
					const projectMember = await sequelize.models.projects_members.findOne({
						where: {
							projectId: this.id,
							userId: user.id
						}
					});

					if (!projectMember) return false;

					projectMember.update({
                        deletedAt: sequelize.fn('NOW')
                    });

					break;
			}
		}
    }

	return projects;
};
