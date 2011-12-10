/**
 *
 */
var events = require('events');
var util = require('util');
var net = require('net');
var crypto = require('crypto');

var utils = require('../utils')

var RpcModule = require('../rpc').RpcModule

var Socket = module.exports = function(socket) {

	RpcModule.call(this);
	/**
	 * Pass socket errors on up the chain.
	 * @private
	 */
	var onError = function(error) {
		throw error;
	};
	/**
	 * Handle our incoming data
	 * @private
	 */

	var onData = function(data) {
		data = data.toString();
		if(data.indexOf('\n') > -1) {
			var message = this.buffer.join('');
			data = data.split('\n');
			message += data.shift();
			var decipher = crypto.createDecipher(this.algorithm, this.key);
			var decrypted = decipher.update(message, 'hex', 'utf8') + decipher['final']('utf8');
			this.buffer = [];
			
			this.requestEvent(JSON.parse(decrypted));
			data = data.join('\n');
			if(data.length) {
				onData.bind(this)(data);
			}
		} else {
			this.buffer.push(data);
		}
	};
	/**
	 * If end is received, then destroy the socket
	 */
	var onEnd = function() {

	}

	this.destroyed = false;
	this.socket = socket;

	this.algorithm = '';
	this.key = '';
	this.buffer = [];

	var onWrite = function(data) {
		var cipher = crypto.createCipher(this.algorithm, this.key);
		var encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher['final']('hex') + '\n';
		this.socket.writable ? this.socket.write(encrypted) : null;
	};

	this.write = onWrite.bind(this);

	socket.on('data', onData.bind(this));
	socket.on('error', onError.bind(this));
	socket.on('end', onEnd.bind(this));

};
/**
 * Inherits from EventEmitter
 */
util.inherits(Socket, RpcModule);

Socket.prototype.setAgorithm = function(algorithm) {
	this.algorithm = algorithm;
}
Socket.prototype.setKey = function(key) {
	this.key = key;
}
/**
 * Destroys the socket connection
 */
Socket.prototype.destroy = function() {
	console.log('Received destroy request for peer: ' + this.id);
	this.socket.destroy();
	this.destroyed = true;
	this.emit('end');
};
