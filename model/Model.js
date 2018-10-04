const {
    PtlObject
} = require('../core');

const createEntityClass = require('./entity');
const Field = require('./Field');
const ComputedField = require('./ComputedField');
const ReferenceField = require('./ReferenceField');


class Model extends PtlObject {
    constructor(name, version, members) {
        super(name, version);

        this.fields = {};
        this.computedFields = {};
        this.methods = {};
        this.references = {};

        this.primaryKeyFieldNames = [];

        for (let memberName in members) {
            const member = members[memberName];
            if (member instanceof Field) {
                // regular column
                this.addField(memberName, member);
            } else if (member instanceof ComputedField) {
                // computed column
                this.addComputed(memberName, member);
            } else if (member instanceof ReferenceField) {
                // reference column
                this.addReference(memberName, member);
            } else if (member instanceof Function) {
                // model method
                this.addMethod(memberName, member);
            } else {
                throw new TypeError(`Unknown model member ${memberName} in definition of ${name}`);
            }
        }

        if (!this.primaryKeyFieldNames.length) {
            throw new TypeError(`Model definition for ${name} lacks a primary key field`);
        }

        this.entityClass = createEntityClass(this);
    }

    addField(name, field) {
        this.fields[name] = field;
        field.name = name;
        field.model = this;
        if (field.primary) {
            this.primaryKeyFieldNames.push(name);
        }
    }
    addComputed(name, field) {
        this.computedFields[name] = field;
        field.name = name;
        field.model = this;
    }
    addMethod(name, method) {
        this.methods[name] = method;
    }
    addReference(name, field) {
        this.references[name] = field;
        field.name = name;
        field.model = this;

        // also we need to add appropriate FK field and name it, if it wasn't added manually
        let fkFieldName = field.fkFieldName;
        if (!fkFieldName) {
            const idName = field.idFieldName;
            const IdName = idName[0].toUpperCase() + idName.substr(1);
            fkFieldName = name + IdName;
            field.fkFieldName = fkFieldName;
        }
        const refIdField = field.getIdField();
        if (this.fields[fkFieldName]) {
            // this field was already manually added, typecheck and exit
            const manuallyAddedFkField = this.fields[fkFieldName];
            if (manuallyAddedFkField.type !== refIdField.type) {
                const refName = field.referencedModel.name;
                const expectedType = refIdField.type;
                const gotType = manuallyAddedFkField.type;
                throw new TypeError(
                    `FK ${this.name}::${idFieldName} for ${refName} should be of type ${expectedType}, not ${gotType}`
                );
            }
        } else {
            // it was not added manually by user, so we need to add it automatically
            const autoAddedFkField = refIdField.clone();
            this.addField(fkFieldName, autoAddedFkField);
        }

        // also attach appropriate fields or async computeds to generate entity class members
        if (field.essential) {
            // autofetched refs behave like regular fields
            const refAsRegularField = field.asRegularField();
            this.addField(name, refAsRegularField);
        } else {
            const refAsComputed = field.asAsyncComputed();
            this.addComputed(name, refAsComputed);
        }
    }

    intoStream(value, stream, target = {}) {
        const fields = this.fields;
        for (let fieldName in fields) {
            const field = fields[fieldName];
            if (field.allowedFor(stream)) {
                target[fieldName] = value[fieldName];
                if (target[fieldName] === void 0) {
                    target[fieldName] = field.getDefaultValue(); // throws TypeError if has no default
                }
                if (!field.checkValue(target[fieldName])) {
                    throw new TypeError(
                        `${target[fieldName]} is not a valid value for ${field} of type ${field.typeString()}`
                    );
                }
            }
        }
        return target;
    }
}

module.exports = Model;
