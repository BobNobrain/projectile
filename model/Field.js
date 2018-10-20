const { abstract } = require('../helpers/errors');

class Field {
    constructor(type) {
        this.name = null;
        this.type = type;
        this.required = true;
        this.primary = false;
        this.defaultValue = void 0;

        this.model = null;

        this.meta = {
            label: null,
            description: null,
            hidden: false
        };
    }

    nullable() {
        this.required = false;
        return this;
    }
    default(value) {
        if (typeof value !== typeof eval) {
            // can typecheck only if no need do call a function
            if (!this.checkValue(value))
                throw new TypeError(`Cannot assign default value ${value} to field ${this.name}`);
        }
        this.defaultValue = value;
        return this;
    }
    PK() {
        this.required = true;
        this.primary = true;
        return this;
    }
    hide() {
        this.meta.hidden = true;
        return this;
    }
    meta(label, description) {
        this.meta.label = label;
        this.meta.description = description;
        return this;
    }

    checkValue(value) {
        abstract('Field::checkValue');
    }
    getDefaultValue() {
        if (this.defaultValue === void 0) {
            if (!this.required) return null;
            throw new TypeError(`Required value of field ${this.model.name}::${this.name} was not specified`);
        } else {
            if (typeof this.defaultValue === typeof Function) {
                return this.defaultValue();
            } else {
                return this.defaultValue;
            }
        }
    }

    clone(premadeInstance = new Field(this.type)) {
        Object.assign(premadeInstance, this, {
            meta: {
                label: null,
                description: null,
                hidden: false
            }
        });
        return premadeInstance;
    }

    toString() {
        return `${this.typeString()} ${this.model.name}::${this.name}`;
    }
    typeString() {
        return this.type;
    }
}

module.exports = Field;
