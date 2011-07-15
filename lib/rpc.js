var events = require('events');

var util = require('util');

var rpc = module.exports = function() {

	var self = this;
	this.counter = 0;

	this.functions = {};
	this.METHOD_NOT_ALLOWED = "Method Not Allowed";
	this.INVALID_REQUEST = "Invalid Request";
	this.on('handleRequest', this.handleRequest).on('applyFunc', this.applyFunc)

	this.expose('list', function() {
		var list = [];
		console.log('list')
		for ( var key in self.functions) {
			this.pushResult(key);
		}
		this.send();
	});
};

// So will act like an event emitter
util.inherits(rpc, events.EventEmitter);

var Exposed = rpc.prototype.Exposed = function(message, info, callBack) {
	// Hidding it for now but need to move into own file.

	events.EventEmitter.call(this);

	var hasSent = false;
	this.setartTime = new Date().getTime();
	this.id = message.id;
	this.method = message.method;
	this.params = message.params;
	this.info = info;
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
			result : this.result.length === 0 ? null : this.result,
			error : this.error.length === 0 ? null : this.error
		})
		hasSent = true;
	});
	//
	this.on('result', this.pushResult);
	this.on('error', this.pushError);
	return this;
};

// So will act like an event emitter
util.inherits(Exposed, events.EventEmitter);

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
		code : code || 1000
	})
	return this;
};

rpc.prototype.handleRequest = function(message, info, callBack) {

	if (!message.hasOwnProperty('id')) {

		return callBack({
			'result' : null,
			'error' : {
				'message' : this.METHOD_NOT_ALLOWED,
				'code' : 1001
			},
			'id' : null
		});
	}

	if (!(message.hasOwnProperty('method') && typeof (message.method) === 'string' && message.hasOwnProperty('params'))) {
		return callBack({
			'result' : null,
			'error' : {
				'message' : this.METHOD_NOT_ALLOWED,
				'code' : 1002
			},
			'id' : message.id
		});
	}

	if (!this.functions.hasOwnProperty(message.method)) {
		return callBack({
			'result' : null,
			'error' : {
				'message' : this.INVALID_REQUEST,
				'code' : 1003
			},
			'id' : message.id
		});
	}
	var exsosed = new Exposed(message, info, callBack);

	var method = this.functions[message.method];

	this.counter++;
	this.emit('applyFunc', method, message.params, exsosed);

};
//
rpc.prototype.applyFunc = function(method, params, exsosed) {
	method.apply(exsosed, params);
	try {

	} catch (err) {
		console.log(err)
		throw err
	}
}
//
rpc.prototype.expose = function(mod, object) {
	if (typeof (object) === 'object') {

		var funcs = [];

		for ( var funcName in object) {
			var funcObj = object[funcName];
			if (typeof (funcObj) == 'function') {
				this.functions[mod + '.' + funcName] = funcObj;
				funcs.push(funcName);
			}
		}

	} else if (typeof (object) == 'function') {

		this.functions[mod] = object;

	}

	return this;
}
