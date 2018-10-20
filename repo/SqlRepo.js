const Repo = require('./Repo');

class SqlRepo extends Repo {
    constructor({
        executeSqlQuery
    }) {
        this.executeSqlQuery = executeSqlQuery;
        this.modelsRegistry = {};
    }

    registerModel(repoModelName, model) {
        this.modelsRegistry[repoModelName] = model;
    }

    findRegisteredModel(modelName) {
        for (let repoModelName in this.modelsRegistry) {
            if (this.modelsRegistry[repoModelName].name === modelName) {
                return repoModelName;
            }
        }
        return null;
    }

    async query(query) {
        const { type } = query;
        let sql = '';
        if (type === 'R') {
            sql = this.readQueryToSql(query);
        } else if (type === 'L') {
            sql = this.listQueryToSql(query);
        } else if (type === 'C') {
            sql = this.createQueryToSql(query);
        } else if (type === 'U') {
            sql = this.updateQueryToSql(query);
        } else if (type === 'D') {
            sql = this.deleteQueryToSql(query);
        } else if (type === 'M') {
            sql = this.methodQueryToSql(query);
        } else {
            throw new TypeError(`Unknown query type "${type}"`);
        }

        const result = await this.executeSqlQuery(sql);
        return result;
    }

    listQueryToSql({
        modelName,
        fields,
        relationships
    }) {
        const model = this.findRegisteredModel(modelName);

        for (let refName in references) {
            const reference = references[refName];
            const rFields = reference.fields;
            const rModel = model.references[refName].referencedModel;
            const rModelName = this.findRegisteredModel(rModel.name);
            // ...
        }
    }
}

module.exports = SqlRepo;
