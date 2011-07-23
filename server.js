var Manager = require('./lib/manager');

var manager = new Manager//init the manager.

//manager.load()//load the rpc modules.
console.log(manager)

//setup the front end server.
var server = manager.createServer({
	port : 9999,
	host : 'localhost',
	type : 'http',
	root : '/home/bob/Sencha-demo',
	hasSocket : true
})

console.log(server)