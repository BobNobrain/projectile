const { Field } = require('../model');

const types = [
    'string',
    'int',
    'float',

    'PK'
];

module.exports = types.reduce(
    (e, typename) => {
        const c = require('./' + typename)(Field);
        e[typename] = function (...args) {
            return new c(...args);
        }
        return e;
    },
    {}
);
