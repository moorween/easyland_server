module.exports = (sequelize, model) => {
    let protectedFields = [];

    let hiddenFields = Object.keys(model.tableAttributes).filter(field => model.tableAttributes[field].secret);
    hiddenFields = [...hiddenFields, ...sequelize.options.defaultHidden];

    const protect = () => {
        protectedFields = Object.keys(model.tableAttributes).filter(field => model.tableAttributes[field].protect)
        protectedFields = [...protectedFields, ...(sequelize.options.defaultProtected || [])];
    }

    model.addHook('beforeCreate', (instance, options) => {
        if (options.unprotect === true) return false;
        for (const field of protectedFields.filter(field => (options.unprotect || []).indexOf(field) < 0)) {
            instance.dataValues[field] = model.tableAttributes[field].defaultValue;
        }
    });

    model.addHook('beforeUpdate', (instance, options) => {
        if (options.unprotect === true) return false;
        for (const field of protectedFields.filter(field => (options.unprotect || []).indexOf(field) < 0)) {
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