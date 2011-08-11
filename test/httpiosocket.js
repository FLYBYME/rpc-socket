var manager = require('../lib/manager');

//setup the front end server.
var server = manager.createServer({
	port : 9999,
	host : '208.53.183.73',
	type : 'http',
	root : '/var/www',
	hasSocket : true
})
