const PtlBase = require('./PtlBase');
const PtlObject = require('./PtlObject');
const PtlVariable = require('./PtlVariable');
const SyncStrategy = require('./SyncStrategy');
const { required } = require('../helpers/errors');
const { typename } = require('../helpers');


class LayerContext {
    constructor(layer) {
        this.layer = layer;
        this.content = {};
    }

    define({
        name = required('name'),
        type = required('type'),
        value = null,
        nullable = false,
        sourceAt = this.layer,
        syncStrategy = SyncStrategy.NEVER
    }) {
        const v = this.content[varName];
        if (v) {
            throw new ReferenceError(`Variable ${varName} aready exists on ${this.layer}`);
        }
        this.content[name] = new PtlVariable({
            name,
            type,
            value,
            nullable,
            sourceAt,
            syncStrategy,
            layer
        });
    }

    has(varName) {
        return this.content[varName] !== void 0;
    }
    get(varName) {
        const v = this.content[varName];
        if (!v) {
            throw new ReferenceError(`Variable ${varName} does not exist on ${this.layer}`);
        }
        return v.getValue();
    }
    set(varName, value) {
        const v = this.content[varName];
        if (!v) {
            throw new ReferenceError(`Variable ${varName} does not exist on ${this.layer}`);
        }
        v.setValue(value);
    }
}


class PtlLayer extends PtlBase {
    constructor(...args) {
        super(...args);
        this.content = {};
        this.context = new LayerContext(this);
        this.connected = {};
    }

    attach(ptlObject) {
        if (!(ptlObject instanceof PtlObject))
            throw new TypeError(`Cannot attach object ${ptlObject}`);

        const { name } = ptlObject;
        if (this.content.hasOwnProperty(name))
            throw new ReferenceError(`Layer ${this} already has object named ${name}: ${this.content[name]}`);
        this.content[ptlObject.name] = ptlObject;
        ptlObject.layer = this;
        return this;
    }

    getObject(name, { type, version } = {}) {
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
                throw new PtlBase.VersionError('Version too low', actualVersion);
            }
        }
        return obj;
    }

    call(objectName, methodName, args) {
        const obj = this.getObject(objectName);
        return obj.call(methodName, args);
    }

    connect(direction, anotherLayer) {
        if (!(anotherLayer instanceof PtlLayer))
            throw new TypeError(`Cannot connect ${this} to ${anotherLayer} as ${direction}: not a PtlLayer`);
        this.connected[direction] = anotherLayer;
    }

    toString() {
        return `[PtlLayer "${this.name}" @${this.version}]`;
    }
}

module.exports = PtlLayer;
