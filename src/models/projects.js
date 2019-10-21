/* jshint indent: 1 */

const Op = require('sequelize').Op;

module.exports = function (sequelize, DataTypes) {
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
            validate: {notNull: true, notEmpty: true},
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
        defaultScope: {
            attributes: {exclude: ['clientId']},
            include: [
                {
                    association: 'members',
                    through: {
                        as: 'memberDetails',
                        attributes: {exclude: ['id', 'userId', 'projectId', 'updatedAt', 'deletedAt', 'deletedBy']}
                    }
                },
                {
                    association: 'client',
                    attributes: {exclude: ['deletedAt', 'deletedBy']}
                }
            ]
        },
        scopes: {
            active: {
                attributes: {exclude: ['deletedAt', 'deletedBy']},
                where: {
                    deletedAt: null
                }
            },
            deleted: {
                where: {
                    deletedAt: {
                        [Op.ne]: null
                    }
                },
                include: [
                    {
                        association: 'client',
                        attributes: {exclude: ['deletedAt', 'deletedBy']}
                    }
                ]
            }
        }
    });

    projects.prototype.assignMembers = async function (members) {
        members = typeof members === 'string' ? JSON.parse(members) : members;
        let originalMembers = [...(this.members || []).map(member => member.id)];

        for (const member of members) {
            if (originalMembers.indexOf(member.id) === -1) {
                const user = await sequelize.models.users.findByPk(member.id);
                if (!user) return false;

                await this.addMember(user, {through: {role: (member.memberDetails || {}).role}});
            } else {
                originalMembers.splice(originalMembers.indexOf(member.id), 1);
            }
        }
        for (const id of originalMembers) {
            const projectMember = await sequelize.models.projects_members.findOne({
                where: {
                    projectId: this.id,
                    userId: id
                }
            });

            if (!projectMember) return false;

            await projectMember.destroy();
        }
    }

    return projects;
};
