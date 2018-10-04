const ptl = require('ptl-rpc');

const account = require('./models/Account').model;
const person = require('./models/Person').model;
const role = require('./models/Role').model;

const api = ptl.layer('api', 1);
api.attach(account);
api.attach(person);
api.attach(role);

apiServer = ptl.remoteLayer('api', 1).at('/api/ptl');

api.context.define({
    name: 'auth',
    type: account,
    value: null,
    nullable: true,
    sourceAt: apiServer,
    syncStrategy: ptl.SyncStrategy.ON_DEMAND // or always or never
});
api.context.define({
    name: 'token',
    type: String,
    value: null,
    nullable: true,
    sourceAt: api
});

api.connect('remote', apiServer);
