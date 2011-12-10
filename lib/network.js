var utils = require('./utils')

var RpcModule = require('./rpc').RpcModule
var Socket = require('./protocols/socket')

var events = require('events');
var util = require('util');
var net = require('net');

var crypto = require('crypto');
/***
 *
 *
 *
 */

var Network = module.exports = function() {

	events.EventEmitter.call(this);
	this.algorithm = '';
	this.key = '';

	this.sockets = {};

};
/***
 * Make it an event
 */
util.inherits(Network, events.EventEmitter);

Network.prototype.setAgorithm = function(algorithm) {
	this.algorithm = algorithm;
	return this;
}
/**
 *
 */

Network.prototype.setKey = function(key) {
	this.key = key;
	return this;
}
/***
 *
 *
 */
Network.prototype.addTcpSocket = function(socket) {

	var _socket = new Socket(socket);
	var self = this;
	var onReady = function() {

		self.emit('rpc', _socket)

	}
	_socket.expose('ready', onReady);
	/**
	 *
	 */
	_socket.setAgorithm(this.algorithm);
	_socket.setKey(this.key);

	/**
	 *
	 */
	return _socket;
}
/**
 *
 *
 */
Network.prototype.createTcpServer = function() {

	var server = net.Server();
	/**
	 * Listens for new connections and adds a peer for each one
	 */
	function onConnection(socket) {
		console.info('Peer connection request received');
		/**
		 *
		 */
		var _socket = this.addTcpSocket(socket);
		/**
		 *
		 */
		var onEnd = function() {
			console.log('End event fired');
			delete this.sockets[_socket.id];
			this.emit('removed', _socket);
		}
		/**
		 *
		 */
		this.sockets[_socket.id] = _socket.on('end', onEnd.bind(this));
		_socket.invoke('ready', [], noop)
	}

	/**
	 * Print some info once we are listening
	 */
	function onListen() {
		console.info('Servent listening on: ' + JSON.stringify(server.address()));
	}

	/**
	 *
	 */
	server.id = utils.uuid();

	/**
	 *
	 */
	server.on('connection', onConnection.bind(this));
	server.on('listening', onListen.bind(this));
	return server;
}
/**
 *
 *
 *
 */

Network.prototype.connectAsTcp = function(port, host) {

	var socket = net.connect(port, host);
	/**
	 * When we connect, register the socket as a peer
	 */
	function onConnect() {
		var _socket = this.addTcpSocket(socket);
		/**
		 *
		 */
		var onEnd = function() {
			console.log('End event fired');
			delete this.sockets[_socket.id];
			this.emit('removed', _socket);
		}
		/**
		 *
		 */
		this.sockets[_socket.id] = _socket.on('end', onEnd.bind(this));

		_socket.invoke('ready', [], noop)
	}


	socket.on('connect', onConnect.bind(this));
};
var noop = function() {
};
