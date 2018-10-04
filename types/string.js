module.exports = function (Field) {
    class StringField extends Field {
        constructor(length) {
            super('string');
            this.length = length;
        }
        checkValue(s) {
            if (typeof s !== typeof '') return false;
            if (typeof this.length === typeof 0) {
                if (s.length >= this.length) return false;
            }
            return true;
        }

        clone(premadeInstance = new StringField(this.length)) {
            return super.clone(premadeInstance);
        }
    }
    return StringField;
};
