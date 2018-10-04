const { Model, types: {
    string,
    int,
    enum,
    ref
} } = require('ptl-orm');

const Account = require('./Account');
const SexEnum = require('./SexEnum');

const person = new Model('Person', 1, {
    name: string(30),
    age: int(1).unsigned(),
    sex: enum(SexEnum),

    account: ref(Account).nullable().backref('person')
});

const Person = person.entityClass;

module.exports = Person;
