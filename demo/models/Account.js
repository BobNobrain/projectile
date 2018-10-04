const {
    Model,
    computed,
    types: {
        string,
        int,
        enum,
        ref
    }
} = require('ptl-orm');

const Role = require('./Role');

const account = new Model('Account', 1, {
    username: string(30),
    // password: computed({
    //     get() {
    //         return '';
    //     },
    //     set(newPassword) {
    //         // TODO: and how will we handle async computeds?
    //         this.passwordHash = bcrypt.hashSync(newPassword, 10);
    //     }
    // }),

    password: computed({
        get() {
            return '';
        },
        set(newPassword) {
            return bcrypt.hash(newPassword, 10)
                .then(result => {
                    this.passwordHash = result;
                    return '';
                });
        }
    }).async(),

    passwordHash: string(64).default(''),

    roles: ref(Role).many({
        pagination: {
            mode: 'none'
        }
    }).autofetch()
});

// $-style: alex.password([value]);

const Account = account.entityClass;

module.exports = Account;
