var RpcModule = require('../rpc').RpcModule

var Process = module.exports = function(p) {

	var onWrite = function(data) {
		p.send({
			data : data
		})
	}
	var onMessage = function(m) {
		m.data ? this.requestEvent(m.data) : null;
	}

	p.on('message', onMessage.bind(this));

	this.write = onWrite.bind(this);

	RpcModule.call(this);

};
/**
 * Inherits from EventEmitter
 */
require('util').inherits(Process, RpcModule);
