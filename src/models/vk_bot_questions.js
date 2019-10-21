/* jshint indent: 1 */
const Op = require('sequelize').Op;

module.exports = function (sequelize, DataTypes) {
    const questions = sequelize.define('vk_bot_questions', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        step: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(96),
            allowNull: false,
            validate: {
                isIn: [['regular', 'noAnswer', 'variants', 'reference']],
                customValidator(value) {
                    switch (value) {
                        case 'variants':
                            if (!this.variants) {
                                throw new Error('variants can\'t be empty');
                            }
                            break;
                        case 'reference':
                            if (!this.reference) {
                                throw new Error('reference can\'t be empty');
                            }
                            break;
                    }
                }
            }
        },
        required: {
            type: DataTypes.BOOLEAN(),
            defaultValue: false,
        },
        text: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        variants: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                try {
                    return JSON.parse(this.getDataValue('variants') || '[]')
                } catch (err) {
                    return [];
                }

            },
            set(value) {
                const variants = typeof value === 'object' ? JSON.stringify(value) : value;
                console.log(value, variants);
                this.setDataValue('variants', variants);
            }
        },
        reference: {
            type: DataTypes.STRING(96),
            allowNull: true
        },
        sticker: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        condition: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        delay: {
            type: DataTypes.INTEGER(11),
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
        tableName: 'vk_bot_questions',
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
        },
        hooks: {
            beforeSave: async (q, options) => {
                const qWithSameStep = await sequelize.models.vk_bot_questions.findOne({
                    where: {
                        step: q.step,
                        id: {
                            [Op.ne]: q.id
                        }
                    }
                });

                if (qWithSameStep) {
                    await sequelize.models.vk_bot_questions.update(
                        {
                            step: sequelize.literal('step + 1')
                        },
                        {
                            where: {
                                step: {
                                    [Op.gte]: q.step
                                },
                                id: {
                                    [Op.ne]: q.id
                                }
                            }
                        }
                    )
                }
            }
        }
    });

    return questions;
};
