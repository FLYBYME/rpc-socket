
var RpcModule = require('../rpc').RpcModule

var Io = module.exports = function(socket) {

	RpcModule.call(this);
	var onWrite = function(data) {
		socket.emit('message', {
			data : data
		});
	}
	var onMessage = function(data) {
		data.data ? this.requestEvent(data.data) : null;
	}
	socket.on('message', onMessage.bind(this));

	this.write = onWrite.bind(this);


};
/**
 * Inherits from EventEmitter
 */
require('util').inherits(Io, RpcModule);
