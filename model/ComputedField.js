class ComputedField {
    constructor(arg) {
        this.name = null;
        this.model = null;
        this.sync = true;

        let getter = arg, setter = void 0;
        if (typeof arg === typeof this) {
            getter = arg.get;
            setter = arg.set;
        }

        if (typeof getter !== typeof Function)
            throw new TypeError(`Incorrect getter for computed field: ${getter}`);

        if (setter !== void 0 && typeof setter !== typeof Function)
            throw new TypeError(`Incorrect setter for computed field: ${setter}`);

        this.getter = getter;
        this.setter = setter;
    }

    async() {
        this.sync = false;
        return this;
    }

    toString() {
        return this.model.name + '::>' + this.name;
    }
}

module.exports = ComputedField;
