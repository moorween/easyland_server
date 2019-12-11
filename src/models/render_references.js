const Op = require('sequelize').Op;
/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('render_references', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.TEXT(),
            allowNull: false,
        },
        key: {
            type: DataTypes.JSON(),
            allowNull: false,
        },
        value: {
            type: DataTypes.JSON(),
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
        tableName: 'render_references',
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
