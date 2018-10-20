class Entity {
    identify() {
        return this[this.constructor.model.pkField.name];
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

Entity.read = function (identity) {
    return model.read(identity)
        .then(readData => new this(readData));
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
        constructor(values, virtual) {
            // fulfill all fields
            for (let fieldName in model.fields) {
                this[fieldName] = values[fieldName];
            }
            this._orm = {
                virtual
            };
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
            EntitySubclass[computedPropertyName] = function asyncComputed(...args) {
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
