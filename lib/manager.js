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

	this.rpc = (new RPC).load();

	return this
};
// So will act like an event emitter
util.inherits(Manager, events.EventEmitter);

/***
 * Manager.getSocket
 */
Manager.prototype.getSocket = function(id) {
	return this.servers[id]
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
