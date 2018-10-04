class Entity {
    identify() {
        const result = {};
        const pkNames = this.constructor.model.primaryKeyFieldNames;
        for (let i = 0; i < pkNames.length; i++) {
            result[pkNames[i]] = this[pkNames[i]];
        }
        return result;
    }

    wasSaved() {
        const id = this.identify();
        const hasUpstream = Object.keys(id)
            .map(fieldName => id[fieldName])
            .every(idValue => idValue !== void 0);
    }

    // TODO: merge returned data into this
    save(additionalData = {}) {
        // const id = this.identify();
        const hasUpstream = this.wasSaved();

        const model = this.constructor.model;

        if (hasUpstream) {
            const updateData = Object.assign(
                model.intoStream(this, 'U'),
                additionalData
            );
            return this.constructor.model.update(updateData);
        } else {
            const createData = Object.assign(
                model.intoStream(this, 'C'),
                additionalData
            );
            return this.constructor.model.create(createData);
        }
    }
    delete(additionalData = {}) {
        const model = this.constructor.model;
        const deleteData = Object.assign(
            model.intoStream(this, 'D'),
            additionalData
        );
        return this.constructor.model.delete(deleteData);
    }
}

Entity.read = function (primaryValues) {
    const model = this.model;
    for (let fieldName in model.fields) {
        const field = model.fields[fieldName];
        if (!field.primary) continue;
        if (!primaryValues.hasOwnProperty(fieldName)) {
            throw new TypeError(`Primary field ${model.name}::${fieldName} is required for Entity::read!`);
        }
    }
    return model.read(primaryValues)
        .then(readData => new this(readData, 'R'));
};
Entity.list = function (parameters) {
    return this.model.list(parameters)
        .then(listResults => listResults.map(readData => new this(readData, 'R')));
};

Entity.callUpstream = function (methodName, args) {
    return this.model.callUpstream(methodName, args);
};

module.exports = function createEntitySubclass(model) {
    const EntitySubclass = class extends Entity {
        constructor(values, stream = 'C') {
            // fulfill all fields
            model.intoStream(values, stream, /*target:*/ this);
        }
    };
    EntitySubclass.model = model;

    // attach model computed properties to prototype
    for (let computedPropertyName in model.computedProperties) {
        const prop = model.computedProperties[computedPropertyName];

        if (prop.sync) {
            // sync computeds
            Object.defineProperty(EntitySubclass, computedPropertyName, {
                get() {
                    return prop.getter(this);
                },
                set(value) {
                    if (!prop.setter)
                        throw new TypeError(`Cannot set computed property ${prop}`);
                    return prop.setter.call(this, value);
                }
            });
        } else {
            // async computeds
            EntitySubclass[computedPropertyName] = function asyncComputed (...args) {
                if (args.length) {
                    return Promise.resolve(prop.setter(this, ...args));
                } else {
                    return Promise.resolve(prop.getter(this));
                }
            }
        }
    }

    // attach model methods to prototype
    for (let methodName in model.methods) {
        EntitySubclass[methodName] = model.methods[methodName];
    }

    // // attach references to prototype
    // for (let referenceName in model.references) {
    //     EntitySubclass[referenceName]
    // }

    return EntitySubclass;
};
