class PtlVariable {
    constructor(params) {
        Object.assign(this, params);
        if (!this.checkValueType(this.value)) {
            throw new TypeError(`Variable ${this} got incorrect value '${this.value}'`);
        }
    }

    checkValueType(value) {
        if (value === void 0) return false;
        if (value === null) return this.nullable;
        if (!(value instanceof this.type)) return false;
        return true;
    }

    getValue() {
        return this.value;
    }
    setValue(value) {
        if (!this.checkValueType(value)) {
            throw new TypeError(`Attempt to set incorrect value '${this.value}' for ${this}`);
        }
    }

    toString() {
        return `[Variable ${this.layer}/${this.name}: ${this.type.name}]`;
    }
}

module.exports = PtlVariable;
