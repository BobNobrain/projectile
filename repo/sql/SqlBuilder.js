class SqlQuery {
    constructor() {
        this.aliases = {};
        this.aliasesSequence = 0;
    }

    getNextAlias(tableName) {
        this.aliasesSequence++;
        this.aliases[this.aliasesSequence] = tableName[0].toLowerCase() + this.aliasesSequence;
        return this.aliasesSequence;
    }

    static select(...args) {
        return new SelectSqlQuery(...args);
    }

    toSql() {
        throw new TypeError('Abstract');
    }
}

class SubQuery {
    // constructor(builder, name) {
    //     this.alias = builder.getNextAlias(name);
    //     this.builder = builder;
    // }
    // aliasName() {
    //     return this.builder.resolveAlias(this.alias);
    // }
}

class TableSQ extends SubQuery {
    constructor(builder, tableName) {
        super(builder, tableName);
        this.alias = builder.getNextAlias(tableName);
        this.tableName = tableName;
        this.resolvedAlias = null;
    }
    toSqlFrom() {
        return `(\`${this.tableName}\` AS \`${this.resolvedAlias}\`)`;
    }
    resolveAliases(prefix, builder) {
        this.resolvedAlias = prefix + builder.aliases[this.alias];
        return this.resolvedAlias;
    }
}

class LeftJoinSQ extends SubQuery {
    constructor(builder, { withTable, withTablePk, fk }) {
        super(builder, null);
        this.right = new TableSQ(builder, withTable);
        this.left = builder.root;
        this.on = {
            left: Array.isArray(fk) ? fk : [this.left.alias, fk],
            right: [this.right.alias, withTablePk]
        };
        this.resolvedAlias = { left: null, right: null };
    }
    toSqlFrom() {
        const { on } = this;
        const r = this.resolvedAlias;
        const left = this.left.toSqlFrom(r.left);
        const right = this.right.toSqlFrom(r.right);
        return `(${left} LEFT JOIN ${right} ON ${on.left} = ${on.right})`;
    }
    resolveAliases(prefix, builder) {
        this.resolvedAlias.left = this.left.resolveAliases(prefix, builder);
        this.resolvedAlias.right = this.right.resolveAliases(prefix, builder);
        this.on.left = builder.resolvePath(this.on.left);
        this.on.right = builder.resolvePath(this.on.right);
        return 'null';
    }
}

class SelectSqlQuery extends SqlQuery {
    constructor(initialTableName) {
        super();
        this.fields = [];
        this.root = new TableSQ(this, initialTableName);
        this.limit = null;
        this.offset = null;
        this.orderBy = null;
    }

    joinLeft(options) {
        this.root = new LeftJoinSQ(this, options);
    }

    tableAlias() {
        return this.root.alias;
    }
    joinedTableAlias() {
        return this.root.right.alias;
    }

    addField(fieldPath) {
        this.fields.push(this.resolvePath(fieldPath));
    }

    resolveAliases() {
        this.root.resolveAliases('', this);
    }
    resolvePath(path) {
        return path.map(
            part => {
                if (typeof part === typeof 0) return '`' + this.aliases[part] + '`';
                return '`' + part + '`';
            }
        ).join('.');
    }

    paginate({ limit, offset }) {
        this.limit = limit;
        this.offset = offset;
    }
    sort({ desc, by }) {
        this.orderBy = {
            field: this.resolvePath(by),
            direction: ['ASC', 'DESC'][+desc]
        };
    }

    toSql() {
        this.resolveAliases();
        const joins = this.root.toSqlFrom();
        const fields = this.fields.join(', ');

        let pagination = '';
        if (this.limit) {
            pagination += ` LIMIT ${this.limit}`;
        }
        if (this.offset) {
            pagination += ` OFFSET ${this.offset}`;
        }

        let sort = '';
        if (this.orderBy) {
            sort = ` ORDER BY \`${this.orderBy.field}\` ${this.orderBy.direction}`;
        }
        return `SELECT ${fields} FROM ${joins}${pagination}${sort};`;
    }
}

module.exports = {
    SqlQuery
};
