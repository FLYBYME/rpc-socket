var net = require('net');

var http = require('http');

var util = require('util');

var events = require('events');

var Socket = require('./socket');

var Server = module.exports = function(port, host) {

	events.EventEmitter.call(this);

	// config info
	this.port = 9999;
	this.host = 'localhost';
	this.build()
	return this
};

// So will act like an event emitter
util.inherits(Server, events.EventEmitter);

Server.prototype.build = function() {
	var self = this;
	var server = this.server = net.createServer()

	server.on("connection", function(socket) {

		self.emit('socket', new Socket(socket));
	});
	server.on("close", function() {
		self.emit('close', server);
	});

	server.listen(this.port);
};

Server.prototype.socketClose = function() {
	var self = this;

};