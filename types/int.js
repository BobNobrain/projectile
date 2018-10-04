module.exports = function (Field) {
    class IntField extends Field {
        constructor(bytes = 4, signed = true) {
            super('int');
            this.bytes = bytes;
            this.signed = signed;
        }
        checkValue(i) {
            if (typeof s !== typeof 0) return false;
            // overflow check
            const { bytes, signed } = this;
            let min = 0, max = 0;
            if (bytes < 4) {
                max = 2 << (bytes * 8);
            } else {
                max = Math.pow(2, bytes * 8);
            }
            if (signed) {
                min = max / 2;
                max = min - 1;
                min = -min;
            } else {
                max -= 1;
            }

            if (i < min || i > max) return false;

            return true;
        }

        unsigned() {
            this.signed = false;
            return this;
        }

        clone(premadeInstance = new IntField(this.bytes, this.signed)) {
            return super.clone(premadeInstance);
        }
    }
    return IntField;
};
