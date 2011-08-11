var events = require('events');

var util = require('util');
var fs = require('fs');

var Exposed = require('./exposed')
var keyGen = require('./utils').keyGen

var rpc = module.exports = function() {

	var self = this;
	this.counter = 0;

	this.functions = {};
	this.promises = {};
	this.expose('list', function() {
		var list = [];
		// console.log('list')
		for ( var key in self.functions) {
			this.pushResult(key);
		}
		this.send();
	});
	return this;
};
// So will act like an event emitter
util.inherits(rpc, events.EventEmitter);

rpc.prototype._runCallBack = function(data) {
	this.promises[data.id].callBack(data.error, data.result, data.id);
	delete this.promises[data.id];
}
rpc.prototype._runError = function(code, id, callBack) {

	switch (code) {
	case 32700:
		callBack({
			'result' : null,
			'error' : {
				'message' : 'Parse error',
				'code' : code
			},
			'id' : id
		})
		break;
	case 32600:
		callBack({
			'result' : null,
			'error' : {
				'message' : 'Invalid Request',
				'code' : code
			},
			'id' : id
		})
		break;
	case 32601:
		callBack({
			'result' : null,
			'error' : {
				'message' : 'Method not found.',
				'code' : code
			},
			'id' : id
		})
		break;
	case 32602:
		callBack({
			'result' : null,
			'error' : {
				'message' : 'Invalid params.',
				'code' : code
			},
			'id' : id
		})
		break;
	case 32603:
		callBack({
			'result' : null,
			'error' : {
				'message' : 'Internal error.',
				'code' : code
			},
			'id' : id
		})
		break;
	case 32000:
	default:
		callBack({
			'result' : null,
			'error' : {
				'message' : 'Server error.',
				'code' : 32000
			},
			'id' : id
		})
	}

	return true;
}

rpc.prototype._runExpose = function(data, socketId, callBack) {

	var exsosed = new Exposed(data, socketId, this, callBack);
	var method = this.functions[data.method];
	var params = data.params;

	this.counter++;

	process.nextTick(function() {
		method.apply(exsosed, data.params);
	});
}

// *************************************//
rpc.prototype.request = function(data, socketId, callBack) {

	// console.log(data)
	if ((data.hasOwnProperty('result') || (data.hasOwnProperty('error') && data.error.length !== 0)) && data.hasOwnProperty('id') && this.promises.hasOwnProperty(data.id)) {
		this._runCallBack(data)
	}
	if (!data.hasOwnProperty('id')) {
		return this._runError(32600, null, callBack);
	}
	if (!(data.hasOwnProperty('method') && typeof (data.method) === 'string')) {
		return this._runError(32600, data.id, callBack);
	}
	if (!data.hasOwnProperty('params') && Array.isArray(data.params)) {
		return this._runError(32602, data.id, callBack);
	}
	if (!this.functions.hasOwnProperty(data.method)) {
		return this._runError(32601, data.id, callBack);
	}
	this._runExpose(data, socketId, callBack)
};
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
};
rpc.prototype.call = function(method, params, socket, callBack) {
	var id = keyGen()

	this.promises[id] = {
		method : method,
		params : params,
		callBack : callBack
	}
	socket.write({
		method : method,
		params : params,
		id : id
	})
}