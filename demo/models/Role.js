const {
    Model,
    computed,
    types: {
        string
    }
} = require('ptl-orm');

const role = new Model('Role', 1, {
    name: string(32),
    code: string(16),
    description: string(256)
});

const Role = role.entityClass;

module.exports = Role;
