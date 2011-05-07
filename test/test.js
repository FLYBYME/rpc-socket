var net = require('net');

var http = require('http');

var events = require('events');

var util = require('util');

var Client = exports.Client = function(port, host, type, options) {
	events.EventEmitter.call(this);
	this.a = true;
	this.on('test', function() {
		console.log(this)
	})

	return this;
};

// So will act like an event emitter
util.inherits(Client, events.EventEmitter);
(new Client).emit('test')

module.exports = function() {
	return 'main'
}
module.exports.info = {
	test : ''
}