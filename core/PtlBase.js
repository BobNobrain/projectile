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

const defaultVersion = new Version(1);


class VersionError extends TypeError {
    constructor(message, v) {
        this.message = message;
        this.version = v;
    }
}


class PtlBase {
    constructor({ name, version }) {
        this.name = String(name);
        if (version === void 0) {
            this.version = defaultVersion;
        } else {
            this.version = new Version(version);
        }
    }

    getName() {
        return `${this.name}@${this.version}`;
    }
}
PtlBase.Version = Version;
PtlBase.VersionError = VersionError;


module.exports = PtlBase;
