var net = require('net');

var http = require('http');

var util = require('util');

var events = require('events');

var Socket = require('./socket');

var Server = module.exports = function(port, host) {

	events.EventEmitter.call(this);

	// config info
	this.port = port;
	this.host = host;
	this.build()
	return this
};

// So will act like an event emitter
util.inherits(Server, events.EventEmitter);

Server.prototype.build = function() {
	var self = this;
	var server = this.server = net.createServer()

	server.on("connection", function(socket) {

		self.emit('socket', socket);
	});
	server.on("close", function() {
		self.emit('close', server);
	});

};

Server.prototype.connect = function() {
	var self = this;
	this.server.listen(this.port, this.host, function() {
		self.emit('open', server);
	});
}
Server.prototype.socketClose = function() {
	var self = this;

};