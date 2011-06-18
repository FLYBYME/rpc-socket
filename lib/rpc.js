var fs = require('fs');

var util = require('util');

var events = require('events');

var config = require('./config');

var utils = require('./utils');

var keyGen = utils.keyGen

var promise = {};

var Rpc = module.exports = function() {

	var self = this;
	this.counter = 0;
	this.functions = {};
	this.emitter = new (require("events")).EventEmitter;
	this.emitter.on('handleRequest', function(message, id, callBack) {

		if (!(message.method && message.params)) {
			return callBack({
				'result' : null,
				'error' : INVALID_REQUEST,
				'id' : id
			})
		}

		if (!self.functions.hasOwnProperty(message.method)) {
			return callBack({
				'result' : null,
				'error' : METHOD_NOT_ALLOWED,
				'id' : id
			})
		}

		var method = self.functions[message.method];
		// message.params.push(connId);
		this.counter++;
		var result = {
			id : id,
			result : null,
			error : null
		};
		var obj = {
			id : id,
			result : function(r) {
				result.result = r;
				return this;
			},
			error : function(e) {
				result.error = e;
				return this;
			},
			send : function() {
				if (result.error !== null) {
					callBack(result)
					return true;
				} else if (result.result !== null) {
					callBack(result)
					return true;
				} else {
					return false;
				}
			}
		}
		method.apply(obj, message.params);
	});
	this.on('list', function() {
		var list = [];
		for ( var key in self.functions) {
			list.push(key)
		}
		this.result(list).send()
	})
	return this;
}
Rpc.prototype.on = function(mod, object) {

	if (typeof (object) === 'object') {

		var funcs = [];

		for ( var funcName in object) {
			var funcObj = object[funcName];
			if (typeof (funcObj) == 'function') {
				this.functions[mod + '.' + funcName] = funcObj;
				funcs.push(funcName);
			}
		}

		console.log('RPC' + 'exposing module: ' + mod + ' [funs: ' + funcs.join(', ') + ']' + 'pass');

	} else if (typeof (object) == 'function') {

		this.functions[mod] = object;

	}

	return this;
}
Rpc.prototype.expose = function(message, callBack) {

	// log('RPC', 'exposing ' + name + ' ', 'pass');

	this.functions[name] = func;

	return this;
};
Rpc.prototype.extend = function(data, callBack) {

	if (data.hasOwnProperty('id') && data.hasOwnProperty('__ID') && data.hasOwnProperty('method') && data.hasOwnProperty('params')) {

		this.emitter.emit('handleRequest', data, data.id, callBack);
	}

	return this;
};
Rpc.prototype.fireEvent = function(method, params, callBack) {
	var id = keyGen()
	var encoded = {
		'method' : method,
		'params' : params,
		'id' : id
	};
	this.emitter.emit('handleRequest', encoded, id, callBack);
	return this;
}

// ==========new rpc==========//

var Exposed = function(message, info, send) {
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
	;

	//
	this.on('send', function send() {
		if (hasSent) {
			throw new Error('should not sent twice.')
		}
		send({
			id : this.id,
			result : this.result,
			error : this.error
		})
	});
	//
	this.on('result', this.pushResult);
	this.on('error', this.pushError);
	return this;
};

// So will act like an event emitter
util.inherits(Connection, events.EventEmitter);

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

var rpc = function() {

	var self = this;
	this.counter = 0;

	this.functions = {};
	var METHOD_NOT_ALLOWED = "Method Not Allowed";
	var INVALID_REQUEST = "Invalid Request";
	this.on('handleRequest', this._handleRequest).on('applyFunc', this._applyFunc)
	this.on('trigger', this.trigger)

	this.expose('list', function() {
		var list = [];
		for ( var key in self.functions) {
			list.push(key);
		}
		this.pushResult(list).send();
	});
};

// So will act like an event emitter
util.inherits(rpc, events.EventEmitter);

rpc.prototype.Exposed = Exposed

rpc.prototype._handleRequest = function(message, info, callBack) {

	if (!message.hasOwnProperty('id')) {
		return callBack({
			'result' : null,
			'error' : {
				'message' : METHOD_NOT_ALLOWED,
				'code' : 1001
			},
			'id' : null
		});
	}
	if (!(message.hasOwnProperty('method') && typeof (message.method) === 'string' && message.hasOwnProperty('params'))) {
		return callBack({
			'result' : null,
			'error' : {
				'message' : METHOD_NOT_ALLOWED,
				'code' : 1002
			},
			'id' : message.id
		});
	}

	if (!this.functions.hasOwnProperty(message.method)) {
		return callBack({
			'result' : null,
			'error' : {
				'message' : INVALID_REQUEST,
				'code' : 1003
			},
			'id' : message.id
		});
	}

	var exsosed = new this.Exposed(message, info, callBack);

	var method = this.functions[message.method];
	// message.params.push(connId);
	this.counter++;
	this.emit('applyFunc', method, exsosed);

};
//
rpc.prototype._applyFunc = function(method, exsosed) {
	try {
		method.apply(exsosed, exsosed.info().params);

	} catch (err) {
		console.log(err)
		throw new Error('Got a error calling function ' + exsosed.info().method)
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

		this.log('RPC' + 'exposing module: ' + mod + ' [funs: ' + funcs.join(', ') + ']' + 'pass');

	} else if (typeof (object) == 'function') {

		this.functions[mod] = object;

	}

	return this;
}

rpc.prototype.trigger = function(method, params, info, callBack) {
	if (!callBack && typeof (info) !== 'function') {
		this.emit('handleRequest', {
			method : method,
			params : params,
			id : keyGen()
		}, {}, callBack)
	}else if(typeof (callBack) !== 'function'){
		this.emit('handleRequest', {
			method : method,
			params : params,
			id : keyGen()
		}, info, callBack)
	}
};