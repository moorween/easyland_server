/* jshint indent: 1 */
const bcrypt = require('bcryptjs');
const Op = require('sequelize').Op;

module.exports = function(sequelize, DataTypes) {
	const users = sequelize.define('users', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		firstName: {
			type: DataTypes.CHAR(128),
			allowNull: true
		},
		lastName: {
			type: DataTypes.CHAR(128),
			allowNull: true
		},
		login: {
			type: DataTypes.CHAR(128),
			allowNull: false,
			validate: {notNull: true, notEmpty: true}
		},
		password: {
			type: DataTypes.CHAR(255),
			allowNull: false,
			validate: {notNull: true, notEmpty: true},
			set(password) {
				this.setDataValue('password', bcrypt.hashSync(password, 10));
			}
		},
		email: {
			type: DataTypes.CHAR(255),
			allowNull: true,
			validate: {isEmail: true}
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
		tableName: 'users',
		timestamps: true,
		defaultScope: {
            attributes: { exclude: ['password', 'login', 'createdAt', 'updatedAt', 'deletedAt', 'deletedBy'] },
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
                }
            },
			noPassword: {
				attributes: { exclude: ['password', 'login'] },
			},
            withProjects: {
                attributes: { exclude: ['password'] },
                include: [{
                    association: 'activeProjects',
                    through: {
                        as: 'memberDetails',
                        attributes: {exclude: ['id', 'userId', 'projectId', 'updatedAt', 'deletedAt', 'deletedBy']}
                    }
                }]
            }
		}
	});

	users.prototype.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    }

    return users;
};
