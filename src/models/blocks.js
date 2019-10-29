/* jshint indent: 1 */

const Op = require('sequelize').Op;

module.exports = function(sequelize, DataTypes) {
	const blocks = sequelize.define('blocks', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		title: {
			type: DataTypes.CHAR(128),
			allowNull: false
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
		tableName: 'blocks',
		timestamps: true,
        defaultScope: {
            include: [{
                association: 'categories',
                through: {
                    as: 'associationDetails',
                    attributes: {exclude: ['id', 'categoryId', 'blockId', 'updatedAt', 'deletedAt', 'deletedBy']}
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
            }
        }
	});

    blocks.prototype.assignCategories = async function (categories) {
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
            const association = await sequelize.models.blocks_categories.findOne({
                where: {
                    blockId: this.id,
                    categoryId: id
                }
            });

            if (!association) return false;

            await association.destroy();
        }
    }

    return blocks;
};
