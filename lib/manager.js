var fs = require('fs');
var util = require('util');
var net = require('net');
var events = require('events');

var Cleints = require('./clients');
var Servers = require('./servers');
var RPC = require('./rpc');
var utils = require('./utils');

var keyGen = utils.keyGen;

var Manager = function() {

	events.EventEmitter.call(this);

	var sockets = this.sockets = {};

	var rpc = this.rpc = (new RPC);

	var newSocket = function(socket) {
		var id = socket.id;
		sockets[id] = socket.on('data', function(data) {
			// console.log(data);
			rpc.request(data, id, function(result) {
				socket.write(result);
			});
		}).on('close', function() {
			delete sockets[id];
		});
	};
	this.servers = (new Servers).on('socket', newSocket);
	this.clients = (new Cleints).on('socket', newSocket);

	return this.load();
};
// So will act like an event emitter
util.inherits(Manager, events.EventEmitter);
/*******************************************************************************
 * Manager.load
 */
Manager.prototype.load = function(modulePath, rpc) {
	var path;
	if (modulePath) {
		path = modulePath
	} else {
		path = __dirname + '/Modules';
	}

	if (!rpc) {
		rpc = this.rpc;
	}
	var self = this;
	console.log(path)
	fs.readdir(path, function(err, files) {
		console.log(arguments);
		for ( var i = files.length - 1; i >= 0; i--) {
			(require(path + '/' + files[i]))(rpc);
		}
	})
	return this;
}
/*******************************************************************************
 * Manager.getSocket
 */
Manager.prototype.getSocket = function(id) {
	return this.sockets[id]
}
/*******************************************************************************
 * Manager.getSockets
 */
Manager.prototype.getSockets = function() {
	return this.sockets
}
/*******************************************************************************
 * Manager.getSockets
 */
Manager.prototype.writeSocket = function(id, data) {
	return this.servers.writeSocket(id, data)
}
/*******************************************************************************
 * Manager.createServer
 */
Manager.prototype.createServer = function(options) {
	var server;
	if (options.type == 'http') {
		server = this.servers.httpServer(options)
	} else if ('tcp') {
		server = this.servers.tcpServer(options)
	}
	return server;
}
/*******************************************************************************
 * Manager.createServer
 */
Manager.prototype.rpcServer = function(options) {

}
/*******************************************************************************
 * Manager.rpcCleint
 */
Manager.prototype.rpcCleint = function(options) {

}
/*******************************************************************************
 * Manager.createClient
 */
Manager.prototype.createClient = function(options) {

	if ('tcp') {
		this.clients.tcpClient(options)
	}
};
/*******************************************************************************
 * Manager.rpcCleint
 */
Manager.prototype.rpcCall = function(method, params, socket, callBack) {
	if (typeof callBack == 'function') {
		if (this.sockets.hasOwnProperty(socket)) {
			this.rpc.call(method, params, this.sockets[socket], callBack)
		}
	}
}
module.exports = new Manager();