module.exports = (sequelize, model) => {
    let protectedFields = [];

    let hiddenFields = Object.keys(model.tableAttributes).filter(field => model.tableAttributes[field].secret);
    hiddenFields = [...hiddenFields, ...sequelize.options.defaultHidden];

    let unprotected = false;

    const protectAll = () => {
        protectedFields = Object.keys(model.tableAttributes).filter(field => model.tableAttributes[field].protect)
        protectedFields = [...protectedFields, ...(sequelize.options.defaultProtected || [])];
        unprotected = false;
    }

    model.addHook('beforeCreate', (instance, options) => {
        if (options.unprotect === true) return false;
        for (const field of protectedFields.filter(field => (options.unprotect || []).indexOf(field) < 0)) {
            instance.dataValues[field] = model.tableAttributes[field].defaultValue;
        }
        if (unprotected) protectAll();
    });

    model.addHook('beforeUpdate', (instance, options) => {
        if (options.unprotect === true) return false;
        for (const field of protectedFields.filter(field => (options.unprotect || []).indexOf(field) < 0)) {
            instance.dataValues[field] = instance._previousDataValues[field];
        }
        if (unprotected) protectAll();
    });

    model.prototype.unprotect = (fields = []) => {
        if (fields.length > 0) {
            protectedFields = protectedFields.filter(field => fields.indexOf(field) < 0);
        } else {
            protectedFields = [];
        }
        unprotected = true;
    }

    model.prototype.protect = (fields = []) => {
        if (fields.length > 0) {
            protectedFields = [...protectedFields, ...fields];
        } else {
            protectAll();
        }
    }

    model.prototype.toJSON =  function ()  {
        const values = Object.assign({}, this.get());

        for (const secret of hiddenFields) {
            delete values[secret];
        }

        return values;
    }

    protectAll();
}
