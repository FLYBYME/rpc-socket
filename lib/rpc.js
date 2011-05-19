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

var rpc = function() {

	var self = this;
	this.counter = 0;

	this.functions = {};
	var METHOD_NOT_ALLOWED = "Method Not Allowed";
	var INVALID_REQUEST = "Invalid Request";
	this.on('handleRequest', this._handleRequest).on('applyFunc', this._applyFunc)

	this.expose('list', function() {
		var list = [];
		for ( var key in self.functions) {
			list.push(key);
		}
		this.result(list).send();
	});
};

// So will act like an event emitter
util.inherits(rpc, events.EventEmitter);
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

	var exsosed = new this.exsposedObject(message.id, message.method, message.params, info, callBack);

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

var exsposedObject = rpc.prototype.exsposedObject = function(id, method, params, info, send) {
	// Hidding it for now but need to move into own file.
	this.a = {
		id : id,
		method : method,
		params : params,
		result : [],
		error : [],
		info : info,
		send : send
	};
};
exsposedObject.prototype.send = function() {
	var a = this.a;
	a.send({
		id : a.id,
		result : a.result,
		error : a.error
	})
};
exsposedObject.prototype.result = function(data) {
	this.a.result.push(data)
};
exsposedObject.prototype.error = function(msg, code) {
	this.a.error.push({
		message : msg,
		code : code || 1000
	})
};
exsposedObject.prototype.info = function() {
	var a = this.a
	return {
		info : a.info,
		method : a.method,
		params : a.params,
		id : a.id
	};
};
rpc.prototype.log = function(msg) {

};