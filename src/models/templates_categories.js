/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('templates_categories', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        categoryId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        templateId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT(),
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
        tableName: 'templates_categories',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['categoryId', 'templateId']
            }
        ]
    });
};
