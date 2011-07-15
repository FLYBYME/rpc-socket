var fs = require('fs');

var util = require('util');

var events = require('events');

var Server = require('./server');

var Manager = module.exports = function(type) {

	events.EventEmitter.call(this);

	this.connections = {};
	this.servers = [];
	this.clients = [];

	this.rpc = {};
	return this
};

// So will act like an event emitter
util.inherits(Manager, events.EventEmitter);

Manager.prototype.Cleint = function() {

};

Manager.prototype.Server = function() {
	var self = this;
	var servers = this.servers

	new Server(null, null).on('open', function(server) {
		if (servers.indexOf(server) <= 1) {
			throw 'server already has opened';
		} else {
			servers.push(server)
		}
		console.log(self)
	}).on('close', function(server) {
		if (servers.indexOf(server) >= 1) {
			throw 'server should be closed';
		} else {
			servers.splice(servers.indexOf(server), 1)
		}
	}).on('socket', function(socket) {
		console.log(socket)
		socket.on('data', function(data) {
			try {
				console.log(JSON.parse(data).id)
			} catch (e) {
				console.log('error')
			}
		})
	});

};
