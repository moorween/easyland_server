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
        for (const member of members) {

            const user = await sequelize.models.users.findByPk(member.id);
            if (!user) return false;

            switch (member.action) {
                case 'assign':
                    await this.addMember(user, {through: {role: (member.memberDetails || {}).role}});
                    break;
                case 'delete':
                    const projectMember = await sequelize.models.projects_members.findOne({
                        where: {
                            projectId: this.id,
                            userId: user.id
                        }
                    });

                    if (!projectMember) return false;

                    await projectMember.destroy();

                    break;
            }
        }
    }

    return projects;
};
