
var events = require('events')


var Exposed  = function(message, rpc, callBack) {
	// Hidding it for now but need to move into own file.

	events.EventEmitter.call(this);

	var hasSent = false;
	this.setartTime = new Date().getTime();
	this.id = message.id;
	this.method = message.method;
	this.params = message.params;
	this.rpc = rpc;
	this.result = [];
	this.error = [];
	// console.log(this)
	//
	this.on('send', function() {

		if (hasSent) {
			throw new Error('should not sent twice.')
		}
		callBack({
			id : this.id,
			result : this.result,
			error : this.error
		})
		hasSent = true;
	});
	//
	this.on('result', this.pushResult);
	this.on('error', this.pushError);
	return this;
};
// So will act like an event emitter
require('util').inherits(Exposed, events.EventEmitter);

Exposed.prototype.send = function() {

	this.emit('send')
};
Exposed.prototype.pushResult = function(data) {

	this.result.push(data)
	return this;
};
Exposed.prototype.pushError = function(msg, code) {
	this.error.push({
		message : msg,
		code : code || 1000,
		method : this.method,
		params : this.params
	})
	return this;
};