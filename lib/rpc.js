

var emitter = new (require("events")).EventEmitter;

var utils = require('./utils');
var keyGen = utils.keyGen
var promise = {};

var METHOD_NOT_ALLOWED = "Method Not Allowed";
var INVALID_REQUEST = "Invalid Request";

var Rpc = module.exports = function() {

	var self = this;
	this.counter = 0;
	this.functions = {};
	this.emitter = new (require("events")).EventEmitter;
	this.emitter.on('handleRequest', function(message, id, callBack) {

		if (!(message.method && message.params)) {
			return callBack({
				'result': null,
				'error': INVALID_REQUEST,
				'id': id
			})
		}

		if (!self.functions.hasOwnProperty(message.method)) {
			return callBack({
				'result': null,
				'error': METHOD_NOT_ALLOWED,
				'id': id
			})
		}

		var method = self.functions[message.method];
		//message.params.push(connId);
		this.counter++;
		var restul = {
			id: id,
			result: null,
			error: null
		};
		var obj = {
			id: id,
			result: function(r) {
				restul.result = r;
				return this;
			},
			error: function(e) {
				restul.error = e;
				return this;
			},
			send: function() {
				if(restul.error !== null) {
					callBack(restul)
					return true;
				} else if(restul.result !== null) {
					callBack(restul)
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
		for(var key in self.functions) {
			list.push(key)
		}
		this.result(list).send()
	})
	return this;
}
Rpc.prototype.on = function(mod, object) {

	if(typeof(object) === 'object') {

		var funcs = [];

		for (var funcName in object) {
			var funcObj = object[funcName];
			if (typeof(funcObj) == 'function') {
				this.functions[mod + '.' + funcName] = funcObj;
				funcs.push(funcName);
			}
		}

		console.log('RPC'+ 'exposing module: ' + mod + ' [funs: ' + funcs.join(', ') + ']'+ 'pass');

	} else if(typeof(object) == 'function') {

		this.functions[mod] = object;

	}

	return this;
}
Rpc.prototype.expose = function(message, callBack) {

	//log('RPC', 'exposing ' + name + ' ', 'pass');

	this.functions[name] = func;

	return this;
};
Rpc.prototype.extend = function(data, callBack) {

	if(data.hasOwnProperty('id') && data.hasOwnProperty('method') && data.hasOwnProperty('params')) {

		this.emitter.emit('handleRequest', data, data.id, callBack);
	}

	return this;
};
Rpc.prototype.fireEvent = function(method,params, callBack) {
	var id = keyGen()
	var encoded = {
		'method': method,
		'params': params,
		'id': id
	};
	this.emitter.emit('handleRequest', encoded, id, callBack);
	return this;
}