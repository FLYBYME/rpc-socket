var Manager = require('./lib/manager');

var manager = new Manager//init the manager.

//manager.load()//load the rpc modules.
console.log(manager)

//setup the front end server.
var server = manager.createServer({
	port : 9999,
	host : '192.168.1.100',
	type : 'http',
	root : '/home/bob/Sencha-demo',
	hasSocket : true
})

console.log(server)
//setup the front end server.
var server = manager.createServer({
	port : 9998,
	host : '192.168.1.100',
	type : 'tcp'
})
setTimeout(function() {
	//setup the front end server.
	var cleint = manager.createClient({
		port : 9998,
		host : '192.168.1.100',
		type : 'tcp'
	})

	console.log(cleint)
}, 5000)