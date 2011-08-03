var util = require('util');
var fs = require('fs');
var events = require('events');
var path = require('path');
var http = require('http');
var net = require('net');

var utils = require('./utils');

var mime = utils.Mime;

var mixin = utils.Mixin;

var Socket = require('./socket');

//fs.stat('/home/bob/Sencha-Demo/index.html', function(err, stat) {console.log(arguments);})
var Clients = module.exports = function() {

	events.EventEmitter.call(this);
	this.ifaces = {};

}
// So will act like an event emitter
util.inherits(Clients, events.EventEmitter);

Clients.prototype.tcpClient = function(options) {
	var self = this;
	var socket;
	options = mixin({
		socket : function() {
			self.emit('socket', socket)
		},
		close : function() {
			self.emit('close', socket);
			self.ifaces[socket.id] = socket;
		},
		open : function() {
			self.ifaces[socket.id] = socket;
		}
	}, options);
	socket = net.Stream().on('connect', options.socket).on('close', options.close);
	socket.connect(options.port, options.host, options.open)
	socket = new Socket({
		socket : socket
	})
}