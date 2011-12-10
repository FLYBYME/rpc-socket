/***
 * Node modules
 */
var events = require('events');
var util = require('util');
var fs = require('fs');

/***
 * Local modules
 */
var Exposed = require('./exposed');
var uuid = require('./utils').uuid;

/**
 * RPC-JSON style calls for partition.io
 * Originally taken from rpc-socket
 *
 * @param {Object} initialized peer
 *
 * @return {Object}
 */
var RpcModule = module.exports.RpcModule = function() {

	var self = this;

	events.EventEmitter.call(this);

	this.id = uuid();
	this.vows = {}
	this.functions = {};

	this.on('request', this.requestEvent);

	this.on('handler', function(handler, exsosed, params) {

		console.log(arguments)
		handler.apply(exsosed, params);
	});
	this.expose('list', function() {
		var list = [];
		for(var key in self.functions) {
			this.set(key, 'function');
		}
		this.set('Array', Object.keys(self.functions));
		this.send();
	}).expose('remoteLoad', function(func) {

		var s = new Function('rpc', func)

		self.stack(s(self));
		this.send();
	});
	this.counter = 0;
}
/***
 * Make it an event
 */
util.inherits(RpcModule, events.EventEmitter);

/***
 * Expose modules to every peer
 * @param {String} Base name to the module
 * @param {Object|Function} The module. Can be a function for the
 * module to have onlt one method, or an Object for mulit methods.
 */
RpcModule.prototype.expose = function(mod, object) {
	if( typeof (object) === 'object') {
		var funcs = [];
		var keys = Object.keys(object);
		for(var i = keys.length - 1; i >= 0; i--) {

			var funcObj = object[keys[i]];
			var funcName = keys[i]
			if( typeof (funcObj) == 'function') {

				this.functions[mod + '.' + funcName] = funcObj;
				funcs.push(funcName);
			} else if( typeof (funcObj) == 'object') {
				this.expose(mod + '.' + funcName, funcObj);
			}
		}

		console.log('exposing module: ' + mod + ' [funs: ' + funcs.join(', ') + '] ID: ' + this.id);
	} else if( typeof (object) == 'function') {
		this.functions[mod] = object;
		console.log('exposing ' + mod);
	}

	return this;
};
/***
 * Request event entry point for data
 */
RpcModule.prototype.requestEvent = function(data) {
	if((data.hasOwnProperty('result') || data.hasOwnProperty('error') ) && data.hasOwnProperty('id') && this.vows.hasOwnProperty(data.id)) {
		var vow = this.runVows(data);
		//return;
		return this.emit('handler', vow.handler, vow.exsosed, vow.params);
	}
	if(data.hasOwnProperty('error')) {
		return
		throw data.method;
	}
	if(!data.hasOwnProperty('id')) {
		console.log(data)
		throw ''
		return this.write(this.runError(32600, null));
	}
	if(!(data.hasOwnProperty('method') && typeof (data.method) === 'string')) {
		return this.write(this.runError(32600, data.id));
	}
	if(!data.hasOwnProperty('params') && Array.isArray(data.params)) {
		return this.write(this.runError(32602, data.id));
	}
	if(!this.functions.hasOwnProperty(data.method)) {
		return this.write(this.runError(32601, data.id));
	}
	var result = this.runExpose(data);
	return this.emit('handler', result.handler, result.exsosed, result.params);
};
/***
 * Ready for the exposed methods to be called
 */
RpcModule.prototype.runExpose = function(data) {
	var exsosed = new Exposed(data, this);
	var handler = this.functions[data.method];
	console.log('RPC call  with method: ' + data['method']);
	this.counter++;
	return {
		params : data.params,
		handler : handler,
		exsosed : exsosed
	};
};
/***
 * We have a request return so deal with it.
 */
RpcModule.prototype.runVows = function(data) {

	var vow = this.vows[data.id];
	//
	return {
		params : [data.error, data.result, data.id],
		handler : vow.callBack,
		exsosed : this
	};
};
/***
 * An error so just return it.
 */
RpcModule.prototype.runError = function(code, id) {
	var result = null;
	switch (code) {
		case 32700:
			result = {
				'result' : null,
				'error' : {
					'message' : 'Parse error',
					'code' : code
				},
				'id' : id
			};
		case 32600:
			result = {
				'result' : null,
				'error' : {
					'message' : 'Invalid Request',
					'code' : code
				},
				'id' : id
			};
		case 32601:
			result = {
				'result' : null,
				'error' : {
					'message' : 'Method not found.',
					'code' : code
				},
				'id' : id
			};
		case 32602:
			result = {
				'result' : null,
				'error' : {
					'message' : 'Invalid params.',
					'code' : code
				},
				'id' : id
			};
		case 32603:
			result = {
				'result' : null,
				'error' : {
					'message' : 'Internal error.',
					'code' : code
				},
				'id' : id
			};
		default:
			result = {
				'result' : null,
				'error' : {
					'message' : 'Server error.',
					'code' : 32000
				},
				'id' : id
			};
	}
	console.log('RPC ERROR!! ' + result.error.message);
	return result;
};
/***
 * Invoke a method on the remote peer.
 */
RpcModule.prototype.invoke = function(method, params, callBack) {
	var id = uuid();
	this.vows[id] = {
		method : method,
		params : params,
		callBack : callBack
	};
	this.write({
		id : id,
		method : method,
		nodeId : this.id,
		params : params
	});
	return this;
};
/***
 *
 */
RpcModule.prototype.route = function(name, rpc) {
	this.expose('route.' + name, function(method, params) {
		var exposed = this;
		rpc.invoke(method, params, function(err, result) {
			if(err) {
				exposed.err = err;
			} else {

				exposed.result = result;
			}
			exposed.send()
		})
	});
};
/***
 *
 */
RpcModule.prototype.invokeRoute = function(name, method, params, callBack) {
	this.invoke('route.' + name, [method, params], callBack);
	return this;
};
/***
 *
 */
RpcModule.prototype.stack = function(obj) {
	this.expose(obj[0], obj[1]);
	return this;
};
RpcModule.prototype.remoteLoad = function(module, callBack) {
	this.invoke('remoteLoad', ['return (' + module.toString() + ')(rpc);'], callBack ||
	function() {
	})

	return this;
};
/***
 *
 */
RpcModule.prototype.remoteRouteLoad = function(name, module, callBack) {
	this.invokeRoute(name, 'remoteLoad', ['return (' + module.toString() + ')(rpc);'], callBack ||
	function() {
	})

	return this;
};
