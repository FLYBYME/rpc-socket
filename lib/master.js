var net = require('net');
var Rpc = require('./rpc');

var Master = module.exports = function(port, host, modules) {

	var server = net.createServer()
	server.on('connection', function(socket) {
		socket.setEncoding('utf8')

		var a = new Rpc(socket);
		for(var i = modules.length - 1; i >= 0; i--) {
			require(modules[i])(a)
		};

	})
	server.listen(port, host);
	return server;
}