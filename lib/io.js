var Rpc = require('./rpc');
//
var Io = module.exports = function(port, host, modules) {

	var server = require('socket.io').listen(port).sockets;

	server.on('connection', function(socket) {
		var a = new Rpc(socket);
		for(var i = modules.length - 1; i >= 0; i--) {
			require(modules[i])(a)
		};
	})
}
