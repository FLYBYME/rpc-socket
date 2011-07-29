var fs = require('fs');
var util = require('util');
var net = require('net');
var events = require('events');

var Servers = require('./servers');
var RPC = require('./rpc');
var utils = require('./utils');
var keyGen = utils.keyGen;

var Manager = module.exports = function() {

	events.EventEmitter.call(this);
	var self = this;
	this.servers = (new Servers).on('open', function(server) {
	console.log(server.server)
	}).on('close', function(server) {

	}).on('socket', function(socket) {
		console.log(socket);
		socket.on('data', function(data) {
			console.log(data);
			self.rpc.handleRequest(data, function(result) {
				socket.write(result);
			});
		})
	});
	this.sockets = {};

	this.rpc = (new RPC)

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
		for(var i = files.length - 1; i >= 0; i--) {(require(path + '/' + files[i]))(self.rpc, self);
		}
	})
	return this;
}
/***
 * Manager.getSocket
 */
Manager.prototype.getSocket = function(id) {
	return this.servers.getSocket(id)
}
/***
 * Manager.getSockets
 */
Manager.prototype.getSockets = function(id) {
	return this.servers.getSockets(id)
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
	}
}
/***
 * Manager.createServer
 */
Manager.prototype.rpcServer = function(options) {

}
/***
 * Manager.createClient
 */
Manager.prototype.createClient = function(options) {

};
