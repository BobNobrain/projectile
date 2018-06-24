const { readLayer, registerConverter } = require('projectile');

const adminClient = readLayer(require('./user.ptl'));
const repo = new RemoteRepo('/api/projectile');
adminClient.provideRepo(repo);
