/* jshint indent: 1 */

const Op = require('sequelize').Op;

module.exports = function(sequelize, DataTypes) {
    const templates = sequelize.define('templates', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.CHAR(128),
            allowNull: false,
            validate: { notNull: true, notEmpty: true },
            unique: true
        },
        screenshot: {
            type: DataTypes.CHAR(128),
            allowNull: true
        },
        templatePath: {
            type: DataTypes.CHAR(128),
            allowNull: false,
            unique: true
        },
        indexFile: {
            type: DataTypes.CHAR(128),
            allowNull: false,
            unique: false
        },
        files: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
            get() {
                return JSON.parse(this.getDataValue('files') || '[]')
            },
            set(value) {
                this.setDataValue('files', JSON.stringify(value))
            }
        },
        status: {
            type: DataTypes.CHAR(128),
            allowNull: true,
            defaultValue: 'new'
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
        tableName: 'templates',
        timestamps: true,
        defaultScope: {
            include: [{
                association: 'categories',
                through: {
                    as: 'associationDetails',
                    attributes: {exclude: ['id', 'categoryId', 'templateId', 'updatedAt', 'deletedAt', 'deletedBy']}
                }
            }]
        },
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
            },
            noFiles: {
                attributes: {exclude: ['files', 'templatePath', 'indexFile']}
            }
        }
    });

    templates.prototype.assignCategories = async function (categories) {
        categories = typeof categories === 'string' ? JSON.parse(categories) : categories;

        for (const category of categories || []) {

            const cat = await sequelize.models.categories.findByPk(category.id);
            if (!cat) return false;

            switch (category.action) {
                case 'assign':
                    await this.addCategory(cat, {through: {comment: (category.associationDetails || {}).comment}});
                    break;
                case 'delete':
                    const association = await sequelize.models.templates_categories.findOne({
                        where: {
                            templateId: this.id,
                            categoryId: cat.id
                        }
                    });

                    if (!association) return false;

                    await association.destroy();

                    break;
            }
        }
    }

    return templates;
};
