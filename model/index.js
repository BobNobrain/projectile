const {
    PtlObject
} = require('../core');
const { abstract } = require('../helpers/errors');

class Field {
    constructor(type) {
        this.name = null;
        this.type = type;
        this.required = true;

        this.streams = 'CRU'.split('');

        this.meta = {
            label: null,
            description: null,
            hidden: false
        }
    }

    nullable() {
        this.required = false;
    }
    only(streams) {
        this.streams = streams.split('').filter(s => {
            if (['C', 'R', 'U', 'D'].includes(s)) {
                return true;
            }
            throw new TypeError(`Unknown stream for field: ${s} (allowed values: C, R, U, D)`);
        });
    }

    checkValue(value) {
        abstract('Field::checkValue');
    }
}

class Model extends PtlObject {
    constructor(name, version, content) {
        super(name, version);
        this.content = content;
        this.proto = getPrototype(content);
    }
    connect(prototypeModel) {}
}

new Model('User', 1, {
    id: PK(),
    username: string(),
    createdAt: datetime().only('R'),
    password: string().only('CU'),

    isAncient: computed(user => Date.now() - user.createdAt.getTime() > 1000*60*60*24*365)

    notify: method()
}).connect(apiProvider);

// User.list
//     Model.list
//         apiProvider.list
//             ajax or mock or anything else
