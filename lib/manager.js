var fs = require('fs');
var util = require('util');
var net = require('net');
var events = require('events');

var Servers = require('./servers');
var utils = require('./utils');
var keyGen = utils.keyGen;

var Manager = module.exports = function() {

	events.EventEmitter.call(this);

	this.servers = (new Servers).on('open', function(server) {

	}).on('close', function(server) {

	}).on('socket', function(socket) {

	});
	this.sockets = {};

	this.rpc = {};

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
this.servers.httpServer()
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
