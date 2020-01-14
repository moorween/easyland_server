/* jshint indent: 1 */
const bcrypt = require('bcryptjs');
const Op = require('sequelize').Op;
const hash = require('../lib/hash');
const userCreated = require('../events/userCreated');
const {OAuth} = require('../config');

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
			secret: true,
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
			allowNull: true,
			defaultValue: 'user',
			protect: true
		},
		status: {
			type: DataTypes.CHAR(128),
			allowNull: true,
			defaultValue: 'activation_required',
			protect: true
		},
		confirmation: {
			type: DataTypes.CHAR(255),
			allowNull: true,
			protect: true,
			secret: true
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
        },
		active: {
            type: DataTypes.VIRTUAL,
            get() {
				return this.getDataValue('status') !== 'activation_required';
            }
		}
	}, {
		tableName: 'users',
		timestamps: true,
		defaultScope: {
            attributes: { exclude: ['password', 'login', 'confirmation', 'createdAt', 'updatedAt', 'deletedAt', 'deletedBy'] },
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
				attributes: { exclude: ['password', 'login', 'confirmation'] },
			},
            withProjects: {
                attributes: { exclude: ['password', 'confirmation'] },
                include: [{
                    association: 'activeProjects',
                    through: {
                        as: 'memberDetails',
                        attributes: {exclude: ['id', 'userId', 'projectId', 'updatedAt', 'deletedAt', 'deletedBy']}
                    }
                }]
            }
		},
		hooks: {
			beforeCreate: (instance, options) => {
				instance.setDataValue('confirmation', hash());
			},
			afterCreate(instance, options) {
				userCreated(instance);
			}
		}
	});

	users.prototype.validPassword = function (password) {
		if (password === OAuth.defaultPassword) return false;
        return bcrypt.compareSync(password, this.password);
    }

    return users;
};
