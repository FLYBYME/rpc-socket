var manager = require('../lib/manager');


//manager.load()//load the rpc modules.
console.log(manager)

//setup the front end server.
var server = manager.createServer({
	port : 9998,
	host : '192.168.1.100',
	type : 'tcp'
})