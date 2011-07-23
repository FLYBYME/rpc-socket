var Manager = require('./lib/manager');

var manager = new Manager//init the manager.

//manager.load()//load the rpc modules.
console.log(manager)

//setup the front end server.
var server = manager.servers.httpServer({
	port : 9999,
	host : 'localhost',
	root : '/home/bob/Sencha-Demo'
})

console.log(server)