var Socket = require('./socket');

var events = require('events');
var util = require('util');

var keyGen = require('./utils').keyGen;

var Server = module.exports = function(httpServer) {

	events.EventEmitter.call(this);

	// config info
	this.server = httpServer;
	this.Socket = null;
	this.build()
	return this
};
// So will act like an event emitter
util.inherits(Server, events.EventEmitter);

Server.prototype.build = function() {
	var io = this.Socket = require('socket.io').listen(this.server);
	var self = this

	io.sockets.on('connection', function(socket) {
		self.emit('socket', new Socket(socket, true))

	});
	this.emit('open', io)
}