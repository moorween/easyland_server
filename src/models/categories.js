/* jshint indent: 1 */

const Op = require('sequelize').Op;

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('categories', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.CHAR(128),
            allowNull: false,
            validate: { notNull: true, notEmpty: true },
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
        tableName: 'categories',
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
