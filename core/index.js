const { typename } = require('../helpers');

class Version {
    constructor(v) {
        this.v = String(v)
            .split('.')
            .map(n => {
                if (Number.isNaN(+n)) throw new TypeError(`Unknown version format: ${v}`);
                return +n;
            });
    }
    toString() { return this.v.join('.'); },
    compareTo(anotherVersion) {
        if (!(anotherVersion instanceof Version))
            anotherVersion = new Version(anotherVersion);
        const l = Math.max(this.v.length, anotherVersion.v.length);
        for (let i = 0; i < l; i++) {
            const d = (this.v[i] || 0) - (anotherVersion.v[i] || 0);
            if (d !== 0) return d;
        }
        return 0;
    }
}

class PtlBase {
    constructor({ name, version }) {
        this.name = String(name);
        this.version = new Version(version);
    }
}

class VersionError extends TypeError {
    constructor(message, v) {
        this.message = message;
        this.version = v;
    }
}

class PtlObject extends PtlBase {
    toString() {
        return `[PtlObject "${this.name}" @${this.version}]`;
    }
}

class PtlLayer extends PtlBase {
    constructor(...args) {
        super(...args);
        this.content = {};
    }
    attach(ptlObject) {
        if (!(ptlObject instanceof PtlObject))
            throw new TypeError(`Cannot attach object ${ptlObject}`);

        const { name } = ptlObject;
        if (this.content.hasOwnProperty(name))
            throw new ReferenceError(`Layer ${this} already has object named ${name}: ${this.content[name]}`);
        this.content[ptlObject.name] = ptlObject;
        return this;
    }
    getByName(name, { type, version } = {}) {
        const obj = this.content[name];
        if (!obj) {
            throw new ReferenceError(`Object ${name} does not exist on layer ${this}`);
        }
        if (type) {
            if (!(obj instanceof type)) {
                const et = type.name
                    , ft = typename(obj);
                throw new TypeError(
                    `Requested object ${name} has incompatible type: expected ${et}, found ${ft}`
                );
            }
        }
        if (version) {
            const actualVersion = obj.version;
            if (actualVersion.compareTo(version) < 0) {
                throw new VersionError('Version too low', actualVersion);
            }
        }
        return obj;
    }
    toString() {
        return `[PtlLayer "${this.name}" @${this.version}]`;
    }
}

module.exports = {
    PtlObject,
    PtlLayer,
    Version,
    VersionError
};
