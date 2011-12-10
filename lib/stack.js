/***
 * Node modules
 */
var events = require('events');
var util = require('util');
var fs = require('fs');
/***
 * Local modules
 */
var uuid = require('./utils').uuid;
var Dep = require('./dep');
var RpcModule = require('./rpc').RpcModule;

var Exposed = function(data, stack, rpc) {
	//
	for(var key in stack) {
		this[key] = stack[key];
	}
	this.id = data.id

	this.method = data.method
	this.params = data.params
	//
	this.callBack = function(data) {
		rpc.write(data)
	};
	//
	this.result = {}
	this.err = {}
	this.hasSent = false;
}

Exposed.prototype.send = Exposed.prototype.end = function() {
	if(this.hasSent) {
		throw new Error('should not sent twice.')
	}
	if(arguments.length >= 1) {
		this.set(arguments[0], arguments[1])
	}
	this.callBack({
		id : this.id,
		result : this.result,
		error : this.error['code'] ? this.error : null
	})

	this.hasSent = true;
	return this;
}
Exposed.prototype.add = Exposed.prototype.set = function(key, val) {
	this.result[key] = val;
	return this;
}

Exposed.prototype.get = function(key) {
	return this.result[key];
};

Exposed.prototype.error = function(msg, code) {
	this.err = {
		message : msg,
		code : code || 1000,
		method : this.method,
		params : this.params
	};
	return this.send();
};
var Stack = module.exports = function() {
	RpcModule.call(this);
	var self = this;
	var onWrite = function(data) {
		self.emit('request', data)
	}

	this.write = onWrite.bind(this);
	this.stack = {};

	this.stackExpose({
		create : function(rpc) {
			console.log('create')
		},
		distroy : function(rpc) {
			console.log('distroy')
		},
		locals : {

		},
		modules : {
			load : function(block) {
				var exposed = this;
				console.log(block)
				self.loadCode(block, [{
					val : self,
					key : 'rpc'
				}], self, function() {
					exposed.send()
				})
			}
		},
		name : 'stack'
	})
};
/***
 * Make it an event
 */
util.inherits(Stack, RpcModule);

var expose = function(functions, mod, object) {
	if( typeof (object) === 'object') {
		var funcs = [];
		var keys = Object.keys(object);
		for(var i = keys.length - 1; i >= 0; i--) {

			var funcObj = object[keys[i]];
			var funcName = keys[i]
			if( typeof (funcObj) == 'function') {

				functions[mod + '.' + funcName] = funcObj;
				funcs.push(funcName);
			} else if( typeof (funcObj) == 'object') {
				expose(functions, mod + '.' + funcName, funcObj);
			}
		}

		console.log('exposing module: ' + mod + ' [funs: ' + funcs.join(', ') + ']  ');
	} else if( typeof (object) == 'function') {
		functions[mod] = object;
		console.log('exposing ' + mod);
	}
	return functions;
};
Stack.prototype.stackExpose = function(stack) {

	if(this.validate(stack)) {

		var readyStack = stack.locals

		stack.create.apply(readyStack, [this]);

		this.stack[stack.name] = readyStack;

		expose(this.functions, stack.name, stack.modules)

	}
}
/***
 * Ready for the exposed methods to be called
 */
RpcModule.prototype.runExpose = function(data) {
	var handler = this.functions[data.method];
	var stack = this.stack[data.method.split('.')[0]];
	var exsosed = new Exposed(data, stack || {}, this);
	console.log('RPC call  with method: ' + data['method']);
	this.counter++;
	return {
		params : data.params,
		handler : handler,
		exsosed : exsosed
	};
};

Stack.prototype.loadCode = function(block, locals, self, callBack) {

	var argsKeys = [];
	var argsObjs = [];

	for(var i = 0; i < locals.length; i++) {
		argsKeys.push(locals[i].key);
		argsObjs.push(locals[i].val);
	};

	argsKeys.push('return (' + block + ').apply(this, [' + argsKeys.join(', ') + ']);');

	var compiled = Function.apply(Function, argsKeys);

	var contexts = {
		block : block,
		compiled : compiled,
		locals : locals,
		self : self,
		id : uuid(),
		run : function() {
			compiled.apply(self, argsObjs);
			return contexts;
		}
	};
	callBack(contexts.run());
}
Stack.prototype.sendCode = function(block, callBack) {
	this.invoke('stack.load', [block.toString()], callBack)
}

Stack.prototype.validate = function(stack) {
	if(!stack.create && typeof stack.create !== 'function') {
		throw new Error('stack.create missing or is not a function');
	}
	if(!stack.distroy && typeof stack.distroy !== 'function') {
		throw new Error('stack.distroy missing or is not a function');
	}
	if(!stack.locals && typeof stack.locals !== 'object') {
		throw new Error('stack.locals missing or is not a object');
	}
	if(!stack.modules && typeof stack.modules !== 'object') {
		throw new Error('stack.modules missing or is not a object');
	}
	if(!stack.name && typeof stack.name !== 'string') {
		throw new Error('stack.name missing or is not a string');
	}
	return true;
};
