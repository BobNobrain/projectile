const Field = require('./Field');
const ComputedField = require('./ComputedField');

/**
 * @description Class represents a model field that is a reference to another model.
 *
 * @field multiple           Boolean    Whether this is a multiple reference
 * @field listParameters     Object     Parameters for fetching referenced values via Model::list
 * @field required           Boolean    Whether this ref can be null
 * @field referencedModel    Model      Instance of model that this field refers to
 * @field essential          Boolean    Whether this reference is essential part of model and should be autofetched
 * @field fkFieldName        String     Foreign key field name that creates this ref
 * @field idFieldName        String     Name of primary key field of referenced model
 */
class ReferenceField {
    constructor({ model }) {
        this.name = null;
        this.model = null;
        this.multiple = false;
        this.listParameters = null;
        this.required = true;
        this.referencedModel = model;
        this.essential = false;
        this.fkFieldName = null;

        const pkNames = model.primaryKeyFieldNames;
        if (pkNames.length === 1) {
            this.idFieldName = pkNames[0];
        } else {
            this.idFieldName = void 0;
        }
    }

    nullable() {
        this.required = false;
        return this;
    }
    many(listParameters = {}) {
        this.listParameters = listParameters;
        this.multiple = true;
        return this;
    }
    autofetch() {
        this.essential = true;
        return this;
    }
    by(fieldName) {
        this.idFieldName = fieldName;
        return this;
    }
    via(fieldName) {
        this.fkFieldName = fieldName;
    }

    getIdField() {
        if (!this.idFieldName) return null;
        return this.referencedModel.fields[this.idFieldName] || null;
    }
    getFKField() {
        if (!this.fkFieldName) return null;
        return this.model.fields[this.fkFieldName] || null;
    }

    asRegularField() {
        const result = new Field('ref:' + this.referencedModel.getName());
        if (this.multiple) {
            result.type += '[]';
        }
        result.ref = this;
        result.model = this.model;
        result.required = this.required;
        return result;
    }
    asAsyncComputed() {
        let getter = void 0, setter = void 0;
        if (this.multiple) {
            getter = entity => this.model.list(this.listParameters);
            setter = (entity, values) => {
                if (!Array.isArray(values)) {
                    throw new TypeError(
                        `Cannot set ${this.model.name}::>${this.name}: value is not an array`
                    );
                }

                values = values.slice();

                const q = Promise.resolve(void 0);
                for (let i = 0; i < values.length; i++) {
                    const nextValue = values[i];
                    if (!nextValue.wasSaved()) {
                        q = q.then(() => nextValue.save());
                    }
                }
                q.then(() => {
                    const thisId = entity.identify();

                    return Promise.all(values.map(value => {
                        const id = value.identify();
                        id[this.fkFieldName] = thisId[this.model.primaryKeyFieldNames[0]];
                    }));
                });
            };
        } else {
            getter = entity => this.model.read(entity.identify());
        }

        const result = new ComputedField({
            get: getter,
            set: setter
        });
    }
}
