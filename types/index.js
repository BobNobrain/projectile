const Field = require('../model/Field');
const ComputedField = require('../model/ComputedField');

const types = [
    'string',
    'int',
    // 'float',
    // 'datetime',
    // 'time',
    // 'blob',
    // 'text',
    // 'boolean',
    // 'json'
];

module.exports = types.reduce(
    (e, typename) => {
        const c = require('./' + typename)(Field);
        e[typename] = function (...args) {
            return new c(...args);
        }
        return e;
    },
    {
        computed(...args) {
            return new ComputedField(...args);
        }
    }
);
