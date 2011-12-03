/*!
* partition.io
* Copyright(c) 2011 Russell Bradberry <rbradberry@gmail.com>
* MIT Licensed
*/

/**
 * Module dependencies
 */
var util = require('util')
var utils = require('./utils');
var rpc = require('./rpc').rpc
var EventEmitter = process.EventEmitter
var emit = EventEmitter.prototype.emit;

/**
 * Peer constructor
 *
 * @param {String} id The id for this peer
 * @param {Socket} socket The socket for peer communication
 * @constructor
 */
var Peer = function(id, socket, servent) {
	var buffer = []
	var self = this;

	//
	this.id = id;
	this.destroyed = false;
	this.socket = socket;
	this.servent = servent;
	this.isInitiator = false;
	this.buffer = [];
	//
	this.socket.on('data', this.onData.bind(this));
	this.socket.on('error', this.onError.bind(this));
	this.socket.on('end', this.onEnd.bind(this));
	//
	this.on('recv', this.recv);
	//
	this.rpc = new rpc(this)

};
/**
 * Inherits from EventEmitter
 */
util.inherits(Peer, EventEmitter);

/**
 * Sends a message across the socket
 *
 * @private
 */
Peer.prototype.send = function(data) {
	this.socket.write(JSON.stringify(data) + '\n');
};
/**
 * Handle our incoming data
 *
 * @param {Object} data The data to send over the socket
 */
Peer.prototype.onData = function(data) {
	data = data.toString();
	if(data.indexOf('\n') > -1) {
		var message = this.buffer.join('');
		data = data.split('\n');
		message += data.shift();
		this.buffer = [];
		this.emit('recv', message);
		data = data.join('\n');
		if(data.length) {
			this.onData(data);
		}
	} else {
		this.buffer.push(data);
	}
}
/**
 * If end is received, then destroy the socket
 */
Peer.prototype.onEnd = function() {
	this.destroy();
}
/**
 * Pass socket errors on up the chain.
 * @private
 * */
Peer.prototype.onError = function(error) {
	throw error
}
/**
 * Receives a message
 *
 * @param {String} message The data to be received
 */
Peer.prototype.recv = function(message) {
	var data;
	try {
		data = JSON.parse(message);
	} catch(e) {
		console.error('Could not parse message: ' + message);
	}
	if(data && data.type) {
		switch(data.type) {
			case 'event':
				this.process(data);
				break;
			//the standard events
			case 'rpc':
				this.rpc.eventRequest(data.data);
				break;
			//the standard events
			case 'discovery':
				this.discover(data);
				break;
			//gets information about a peer
			case 'newPeer':
				this.servent.connect(data.port, data.host);
				break;
			//connects to a new peer
			case 'destroy':
				this.destroy();
				break;
			//destoys the connection
		}
	}
};
/**
 * Processes an incoming event request
 *
 * @param {Object} data The data for the incoming event
 */
Peer.prototype.process = function(data) {
	console.info('Processing request with data: ' + JSON.stringify(data));
	var args = data.args || [];

	args.unshift(this);
	args.unshift(data.name);

	this.servent.emit.apply(this.servent, args);
};
/**
 * Here we overwrite the emit method to give a familar feel when using partition.io
 *
 * @param {String} evt The event to emit
 */
Peer.prototype.emit = function(evt) {
	if(evt === 'newListener') {
		emit.apply(this, arguments);
		return;
	}

	var args = Array.prototype.slice.call(arguments, 1), message = {
		type : 'event',
		name : evt,
		args : args
	};

	this.send(message);
};

Peer.prototype.rpcCall = function(data) {
	message = {
		type : 'rpc',
		data : data
	};

	this.send(message);
};

Peer.prototype.invoke = function(method, params, callBack) {
	this.rpc.makeCall(method, params, callBack)
};
/**
 * Discovers information about the peer
 *
 * @param {Object} data Incoming data from another peer
 */
Peer.prototype.discover = function(data) {
	//if there is data, then this is a discovery response
	if(data) {
		this.id = data.id;
		this.port = data.address.port;
		this.host = this.socket.remoteAddress;
		emit.call(this, 'discovered');
	} else {
		this.port = this.socket.remotePort;
		this.host = this.socket.remoteAddress;

		this.send({
			type : 'discovery',
			id : this.servent.id,
			address : this.servent.address()
		});
	}
};
/**
 * Destroys the socket connection
 */
Peer.prototype.destroy = function() {
	console.log('Received destroy request for peer: ' + this.id);
	this.socket.destroy();
	this.destroyed = true;
	emit.call(this, 'end');
};
/**
 * Export the constructor
 */
module.exports = Peer;
