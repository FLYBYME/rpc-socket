var functions = {};

var emitter = new (require("events")).EventEmitter;
var keyGen = require('./keyGen')

var promise = {};

var METHOD_NOT_ALLOWED = "Method Not Allowed";
var INVALID_REQUEST = "Invalid Request";

var Rpc = function() {

	var self = this;
	this.counter = 0;
	this.__defineGetter__("functions", function() {

		return functions;
	});
	emitter.on('handleRequest', function(message, id, callBack) {

		if (!(message.method && message.params)) {
			return callBack({
				'result': null,
				'error': INVALID_REQUEST,
				'id': id
			})
		}
		
		if (!functions.hasOwnProperty(message.method)) {
			return callBack({
				'result': null,
				'error': METHOD_NOT_ALLOWED,
				'id': id
			})
		}

		var method = functions[message.method];
		//message.params.push(connId);
		this.counter++;
		var obj = {
			id: id,
			result: null,
			error: null,
			send: function() {
				if(this.error !== null) {
					callBack({
						'result': null,
						'error': this.error,
						'id': this.id
					})
					return true;
				} else if(this.result !== null) {

					callBack({
						'result': obj.result,
						'error': null,
						'id': this.id
					})
					return true;
				} else {
					return false;
				}
			}
		}
		method.apply(obj, message.params);
	});
	this.expose('list', function() {
		var list = [];
		for(var key in functions) {
			list.push(key)
		}
		this.result = list;
		this.send()
	})
	return this;
}
Rpc.prototype.exposeModule = function(mod, object) {

	var funcs = [];

	for (var funcName in object) {
		var funcObj = object[funcName];
		if (typeof(funcObj) == 'function') {
			functions[mod + '.' + funcName] = funcObj;
			funcs.push(funcName);
		}
	}

	//log('RPC', 'exposing module: ' + mod + ' [funs: ' + funcs.join(', ') + ']', 'pass');

	return this;

};
Rpc.prototype.expose = function(name, func) {

	//log('RPC', 'exposing ' + name + ' ', 'pass');

	functions[name] = func;

	return this;

};
Rpc.prototype.fireEvent = function(method,params, callBack) {
	var id = keyGen()
	var encoded = {
		'method': method,
		'params': params,
		'id': id
	};
	emitter.emit('handleRequest', encoded, id, callBack);
	return this;
}
module.exports = new Rpc()