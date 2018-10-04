const PtlBase = require('./PtlBase');

class PtlObject extends PtlBase {
    constructor(...args) {
        super(...args);
        this.layer = null;
    }

    getName() {
        return `${this.layer.getName()}/${super.getName()}`;
    }

    toString() {
        return `[PtlObject "${this.name}" @${this.version}]`;
    }
}

module.exports = PtlObject;
