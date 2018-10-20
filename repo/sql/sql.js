function select({
    FROM,
    COLUMNS,
    WHERE,
    LIMIT,
    OFFSET
}) {
    const condition = WHERE ? ` WHERE ${WHERE}` : '';
    const limit = LIMIT ? ` LIMIT ${LIMIT}` : '';
    const offset = LIMIT ? ` OFFSET ${OFFSET}` : '';
    return `SELECT ${COLUMNS} FROM ${FROM}${condition}${limit}${offset}`;
}

class AliasedTable {
    constructor(name, alias) {
        this.name = name;
        this.alias = alias;
    }
    toString() { return `${this.name} AS ${this.alias}`; }
}

class Join {
    constructor(table1, col1, table2, col2, alias) {
        this.t1 = table1;
        this.c1 = col1;
        this.t2 = table2;
        this.c2 = col2;
        this.alias = alias;
    }
    toString() {
        const { t1, t2, c1, c2, alias } = this;
        return `(${t1} INNER JOIN ${t2} ON ${t1.alias}.${c1} = ${t2.alias}.${c2} AS ${alias})`;
    }
}

function tables() {
    const aliases = {};
    return {
        next(tableName) {
            const t = tableName[0].toLowerCase();
            const n = aliases[t] || 0;
            const result = new AliasedTable(tableName, t + n);
            aliases[t] = n + 1;
            return result;
        },

        join(...args) {
            return new Join(...args, this.next('j').alias);
        }
    };
}

module.exports = {
    select,
    tables
};
