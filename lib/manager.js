var fs = require('fs');
var util = require('util');
var net = require('net');
var events = require('events');

var Cleints = require('./clients');
var Servers = require('./servers');
var RPC = require('./rpc');
var utils = require('./utils');

var keyGen = utils.keyGen;

var Manager = module.exports = function() {

	events.EventEmitter.call(this);
	var self = this;

	this.sockets = {};
	this.rpcGolbalEvents = new events.EventEmitter
	var rpc = this.rpc = (new RPC);

	this.servers = (new Servers).on('open', function(server) {

	}).on('close', function(server) {

	}).on('socket', function(socket) {
		//console.log(socket);
		self.sockets[socket.id] = socket.on('data', function(data) {
			//console.log(data);
			rpc.handleRequest(data, socket.id, function(result) {
				socket.write(result);
			});
		});
	});
	this.clients = (new Cleints).on('open', function(client) {

	}).on('close', function(client) {

	}).on('socket', function(socket) {
		//console.log(socket);
		self.sockets[socket.id] = socket.on('data', function(data) {
			//console.log(data);
			rpc.handleRequest(data, socket.id, function(result) {
				socket.write(result);
			});
		});
	});
	return this.load();
};
// So will act like an event emitter
util.inherits(Manager, events.EventEmitter);
/**
 * Manager.load
 */
Manager.prototype.load = function(modulePath) {
	var path;
	if(modulePath) {
		path = modulePath
	} else {
		path = __dirname + '/Modules';
	}
	var self = this;
	console.log(path)
	fs.readdir(path, function(err, files) {
		console.log(arguments);
		for(var i = files.length - 1; i >= 0; i--) {
			;(require(path + '/' + files[i]))(self.rpc, self.rpcGolbalEvents);
		}
	})
	return this;
}
/***
 * Manager.getSocket
 */
Manager.prototype.getSocket = function(id) {
	return this.sockets[id]
}
/***
 * Manager.getSockets
 */
Manager.prototype.getSockets = function() {
	return this.sockets
}
/***
 * Manager.getSockets
 */
Manager.prototype.writeSocket = function(id, data) {
	return this.servers.writeSocket(id, data)
}
/***
 * Manager.createServer
 */
Manager.prototype.createServer = function(options) {
	if(options.type == 'http') {
		this.servers.httpServer(options)
	} else if('tcp') {
		this.servers.tcpServer(options)
	}
}
/***
 * Manager.createServer
 */
Manager.prototype.rpcServer = function(options) {

}
/***
 * Manager.rpcCleint
 */
Manager.prototype.rpcCleint = function(options) {

}
/***
 * Manager.createClient
 */
Manager.prototype.createClient = function(options) {

	if('tcp') {
		this.clients.tcpClient(options)
	}
};
/***
 * Manager.rpcCleint
 */
Manager.prototype.rpcCall = function(method, params, socket, callBack) {
	if( typeof callBack == 'function') {
		if(this.sockets.hasOwnProperty(socket)) {
			this.rpc.rpcCall(method, params, this.sockets[socket], callBack)
		}
	}
}