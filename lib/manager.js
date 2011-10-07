var events = require('events');
var util = require('util');
var utils = require('./utils');
var Socket = require('./socket');
var keyGen = utils.keyGen;

/*
 *
 *
 */

var Manager = module.exports = function() {

	this.sockets = {}
	this.servers = {};
	events.EventEmitter.call(this);

}
util.inherits(Manager, events.EventEmitter);
/*
 * type: Event
 * Privare
 */
Manager.prototype.newSocket = function(socket, format, encode) {
	var self = this;
	var s = new Socket(socket, format, encode)
	var id = s.id;
	s.on(format, function(obj) {
		self.emit(format, obj, id, s)
	}).on('connect', this.addSocket.bind(this)).on('close', this.removeSocket.bind(this))
	return s;
}
/*
 * type: Event
 * Privare
 */
Manager.prototype.addSocket = function(socket) {
	this.sockets[socket.id] = socket;
	this.emit('newSocket', socket.id)
}
/*
 * type: Event
 * Privare
 */
Manager.prototype.removeSocket = function(socket) {
	delete this.sockets[socket.id];
	this.emit('closeSocket', socket.id)
}
/*
 * type: Event
 * Privare
 */
Manager.prototype.serverListening = function(server) {
	this.servers[server.id] = server
	this.emit('connect', server.id);
}
/*
 * type: Event
 * Privare
 */
Manager.prototype.serverClose = function(server) {
	delete this.servers[server.id];
	this.emit('close', server.id);
}
/*
 * type: Method
 * Public
 */
Manager.prototype.createServer = function(port, host, format, encode) {
	var self = this;
	var server = net.createServer();
	server.id = keyGen()
	server.on('listening', function() {
		self.serverListening(server)
	})
	server.on('connection', function(socket) {
		self.newSocket(socket, format || 'json', encode || 'utf8')
	})
	server.on('close', function(socket) {
		self.serverClose(server)
	})
	server.listen(port, host);
}
/*
 * type: Method
 * Public
 */
Manager.prototype.createClient = function(port, host, format, encode) {
	var socket = net.Stream();
	var id = this.newSocket(socket, format || 'json', encode || 'utf8').id

	socket.connect(port, host);

	return id;
}
/*
 * type: Method
 * Public
 */
Manager.prototype.socket = function(id) {
	return this.sockets[id];
}
/*
 * type: Method
 * Public
 */
Manager.prototype.server = function(id) {
	return this.servers[id];
}