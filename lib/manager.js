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
	this.blackList = [];
	var self = this;
	this.socketCount = 0;
	var newSocket = function(socket) {
		// console.log('newSocket')
		var id = socket.id;
		self.socketCount++
		sockets[id] = socket.on('data', function(data) {
			// console.log(data);
			rpc.request(data, id, function(result) {
				socket.write(result);
			});

		}).on('close', function() {
			self.emit('socketClose', socket)
			self.socketCount--;
			delete sockets[id];
		});
		self.emit('socket', socket)
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
	var self = this;
	if (options.type == 'http') {
		server = this.servers.httpServer(options)
	} else if (options.type == 'routes') {
		console.log(this.servers)
		server = new this.servers.httpServerInstance(options.port, options.host);
		server.on('certify', function(request, response, callBack) {

			self.certify(request, response, callBack)
		});
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
 * Manager.broadCast
 */
Manager.prototype.broadCast = function(data) {
	var sockets = this.sockets;
	for (key in sockets) {
		this.writeSocket(sockets[key].id, data)
	}
}
/*******************************************************************************
 * Manager.broadCastRpc
 */
Manager.prototype.broadCastRpc = function(method, params, callBack) {
	var sockets = this.sockets;
	for (key in sockets) {

		this.rpc.call(method, params, this.sockets[key], callBack)
	}
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
 * Manager.certify
 */
Manager.prototype.certify = function(request, response, callBack) {
	if (typeof (response) === 'function') {

	} else if (typeof (callBack) === 'function') {
		if (this.blackList.indexOf(request.connection.remoteAddress) >= 0) {

			return callBack(true);
		}
	}

};

/*******************************************************************************
 * Manager.createClient
 */
Manager.prototype.addBlackIp = function(ips) {
	if (Array.isArray(ips)) {
		var blackList = this.blackList;
		for ( var i = ips.length - 1; i >= 0; i--) {
			var ip = ips[i]
			if (!(blackList.indexOf(ip) >= 0)) {
				blackList.push(ip)
			}
		}
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