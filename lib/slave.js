var net = require('net');
var Rpc = require('./rpc');
var keyGen = require('./utils').keyGen;
var Logger = require('./utils').logger

var Slave = module.exports = function(port, host, modules) {

	var socket = net.Stream();
	socket.setEncoding('utf8');
	var a = new Rpc(socket);
	for(var i = modules.length - 1; i >= 0; i--) {
		require(modules[i])(a)
	};
	socket.connect(port, host);
}