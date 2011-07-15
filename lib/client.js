var net = require('net');

var http = require('http');

var util = require('util');

var events = require('events');

var Socket = require('./socket');

var Client = module.exports = function(port, host) {

	events.EventEmitter.call(this);

	// config info
	this.port = 9999;
	this.host = 'localhost';
	this.build()
	return this
};

// So will act like an event emitter
util.inherits(Client, events.EventEmitter);

Client.prototype.build = function() {
	var self = this;
	net.Stream().on('connect', function() {
		var socket = new Socket(this)
		self.emit('socket', socket)

	}).on('close', function() {
		self.emit('close', new Socket(this))
	}).connect(9999, 'localhost', function() {

		console.log('callback');
	});
};

Client.prototype.socketClose = function() {
	var self = this;

};