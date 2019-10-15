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
                isIn: [['regular', 'noAnswer', 'required', 'variants', 'reference']],
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
        text: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        variants: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                return JSON.parse(this.getDataValue('variants') || '[]')
            },
            set(value) {
                this.setDataValue('variants', JSON.stringify(value))
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
