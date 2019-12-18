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
            validate: { notNull: true, notEmpty: true }
        },
        screenshot: {
            type: DataTypes.CHAR(128),
            allowNull: true
        },
        templatePath: {
            type: DataTypes.CHAR(128),
            allowNull: false
        },
        indexFile: {
            type: DataTypes.CHAR(128),
            allowNull: false
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
        files2render: {
            type: DataTypes.JSON(),
            allowNull: true,
            get() {
                return JSON.parse(this.getDataValue('files2render') || '[]')
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
        indexes: [
            {
                unique: true,
                fields: ['name', 'deletedAt']
            }
        ],
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
                attributes: {exclude: ['files', 'files2render', 'templatePath', 'indexFile']}
            }
        }
    });

    templates.prototype.assignCategories = async function (categories) {
        categories = typeof categories === 'string' ? JSON.parse(categories) : categories;
        let originalCategories = [...(this.categories || []).map(cat => cat.id)];

        for (const category of categories) {
            if (originalCategories.indexOf(category.id) === -1) {
                const cat = await sequelize.models.categories.findByPk(category.id);
                if (!cat) return false;

                await this.addCategory(cat, {through: {comment: (category.associationDetails || {}).comment}});
            } else {
                originalCategories.splice(originalCategories.indexOf(category.id), 1);
            }
        }
        for (const id of originalCategories) {
            const association = await sequelize.models.templates_categories.findOne({
                where: {
                    templateId: this.id,
                    categoryId: id
                }
            });

            if (!association) return false;

            await association.destroy();
        }
    }


    templates.random = async function () {
        return await this.findOne({
            where: {
                status: 'ready',
                files2render: {
                    [Op.ne]: null
                }
            },
            order: sequelize.random()
        })
    }
    return templates;
};
