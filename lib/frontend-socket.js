var net = require('net');

var http = require('http');

var util = require('util');

var events = require('events');

var Rpc = require('./rpc');

var fs = require('fs');

var path = require('path');

var join = path.join;

var basename = path.basename;

var normalize = path.normalize;

var utils = require('./utils-http');

var keyGen = require('./utils').keyGen;

var Buffer = require('buffer').Buffer;

var parse = require('url').parse;

var mime = require('./mime');

var Server = module.exports = function(httpServer) {

	events.EventEmitter.call(this);

	// config info
	this.server = httpServer;
	this.Socket = null;

	return this
};
// So will act like an event emitter
util.inherits(Server, events.EventEmitter);

Server.prototype.build = function() {
	var io = this.Socket = require('socket.io').listen(this.server);
	var self = this

	io.sockets.on('connection', function(socket) {
		self.emit('socket', socket)

	});
	this.emit('open', io)
}