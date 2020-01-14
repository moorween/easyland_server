module.exports = (sequelize, model) => {
    let protectedFields = [];

    let hiddenFields = Object.keys(model.tableAttributes).filter(field => model.tableAttributes[field].secret);
    hiddenFields = [...hiddenFields, ...sequelize.options.defaultHidden];

    const protect = () => {
        protectedFields = Object.keys(model.tableAttributes).filter(field => model.tableAttributes[field].protect)
        protectedFields = [...protectedFields, ...(sequelize.options.defaultProtected || [])];
    }

    model.addHook('beforeCreate', (instance, options) => {
        for (const field of protectedFields) {
            instance.dataValues[field] = model.tableAttributes[field].defaultValue;
        }
    });

    model.addHook('beforeUpdate', (instance, options) => {
        for (const field of protectedFields) {
            instance.dataValues[field] = instance._previousDataValues[field];
        }
    });

    model.prototype.unprotect = () => {
        protectedFields = [];
    }

    model.prototype.protect = () => {
        protect();
    }

    model.prototype.toJSON =  function ()  {
        const values = Object.assign({}, this.get());

        for (const secret of hiddenFields) {
            delete values[secret];
        }

        return values;
    }

    protect();
}