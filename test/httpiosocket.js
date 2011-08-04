var manager = require('../lib/manager');

//setup the front end server.
var server = manager.createServer({
	port : 9999,
	host : '192.168.1.100',
	type : 'http',
	root : '/home/bob/Sencha-demo',
	hasSocket : true
})
