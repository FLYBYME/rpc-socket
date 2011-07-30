
var Manager = require('./lib/manager');



var manager = (new Manager)
manager.Server(9999, 'localhost')
console.log(manager)