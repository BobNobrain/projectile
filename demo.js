const { SqlQuery } = require('./repo/sql/SqlBuilder');

const query = SqlQuery.select('accounts');

const primaryTableAlias = query.tableAlias();
query.addField([primaryTableAlias, 'username']);

query.joinLeft({
    withTable: 'profiles',
    withTablePk: 'id',
    fk: 'profile_id'
});

const profileRefAlias = query.joinedTableAlias();
query.addField([profileRefAlias, 'first_name']);
query.addField([profileRefAlias, 'last_name']);
query.addField([profileRefAlias, 'birthday']);

query.joinLeft({
    withTable: 'roles',
    withTablePk: 'id',
    fk: [primaryTableAlias, 'role_id']
});

const rolesRefAlias = query.joinedTableAlias();

query.addField([rolesRefAlias, 'name']);
query.addField([rolesRefAlias, 'description']);

query.paginate({
    limit: 20,
    offset: 10
});

query.sort({
    desc: true,
    by: [primaryTableAlias, 'username']
});

console.log(query.toSql());
