const int = require('./int');

module.exports = function (Field) {
    return class PKField extends Field {
        constructor(typeClass) {
            super(type);
            this.required = true;
            this.streams = 'RUD'.split('');
        }
        nullable() {
            throw new TypeError('Cannot set PK field as nullable!');
        }
        checkValue()
    }
};
