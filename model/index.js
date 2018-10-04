const Model = require('./Model');
module.exports = Model;

// const user = new Model('User', 1, {
//     id: int().PK(),
//     username: string(),
//     createdAt: datetime().only('R'),
//     password: string().only('CU'),
//     rank: int().default(0),

//     isAncient: computed(user => Date.now() - user.createdAt.getTime() > 1000*60*60*24*365)

//     notify() {
//         this.callUpstream('notify', []);
//     }
// }).connect(apiProvider);

// const User = user.getClass();

// const alex = new User({
//     username: 'alex',
//     password: '111'
// });
// alex.save();

// User.list
//     Model.list
//         apiProvider.list
//             ajax or mock or anything else
