var Manager = require('../lib/manager');

var manager = new Manager//init the manager.

//manager.load()//load the rpc modules.
console.log(manager)
var cleint = manager.createClient({
	port : 9998,
	host : '192.168.1.100',
	type : 'tcp'
})