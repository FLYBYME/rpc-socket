var events = require('events');

var util = require('util');
var fs = require('fs');

var Exposed = require('./exposed')

var rpc = module.exports = function() {

	var self = this;
	this.counter = 0;

	this.functions = {};
	this.METHOD_NOT_ALLOWED = "Method Not Allowed";
	this.INVALID_REQUEST = "Invalid Request";
	this.promises = {};
	this.expose('list', function() {
		var list = [];
		// console.log('list')
		for(var key in self.functions) {
			this.pushResult(key);
		}
		this.send();
	});
	return this;
};
// So will act like an event emitter
util.inherits(rpc, events.EventEmitter);

//*************************************//
rpc.prototype.handleRequest = function(data, callBack) {

	if(data.hasOwnProperty('error') && data.error.length !== 0) {
		return
	}
	//console.log(data)
	if(data.hasOwnProperty('result') && data.hasOwnProperty('id') && this.promises.hasOwnProperty(data.id)) {
		this.promises[data.id].callBack(data) 
		delete this.promises[data.id];
		return;
	}
	if(!data.hasOwnProperty('id')) {

		return callBack({
			'result' : null,
			'error' : {
				'message' : this.METHOD_NOT_ALLOWED,
				'code' : 1001
			},
			'id' : null
		});
	}

	if(!(data.hasOwnProperty('method') && typeof (data.method) === 'string' && data.hasOwnProperty('params'))) {
		return callBack({
			'result' : null,
			'error' : {
				'message' : this.METHOD_NOT_ALLOWED,
				'code' : 1002
			},
			'id' : data.id
		});
	}

	if(!this.functions.hasOwnProperty(data.method)) {
		return callBack({
			'result' : null,
			'error' : {
				'message' : this.INVALID_REQUEST,
				'code' : 1003
			},
			'id' : data.id
		});
	}
	var self = this;

	var exsosed = new Exposed(data, this, callBack);
	var method = this.functions[data.method];

	this.counter++;

	process.nextTick(function() {
		method.apply(exsosed, data.params);
	});
};
//
rpc.prototype.expose = function(mod, object) {
	if( typeof (object) === 'object') {

		var funcs = [];

		for(var funcName in object) {
			var funcObj = object[funcName];
			if( typeof (funcObj) == 'function') {
				this.functions[mod + '.' + funcName] = funcObj;
				funcs.push(funcName);
			}
		}

	} else if( typeof (object) == 'function') {

		this.functions[mod] = object;

	}

	return this;
};
rpc.prototype.load = function(modulePath) {
	var path;
	if(modulePath) {
		path = modulePath
	} else {
		path = __dirname + '/Modules';
	}
	var self = this;
	console.log(path)
	fs.readdir(path, function(err, files) {
		console.log(arguments);
		for(var i = files.length - 1; i >= 0; i--) {(require(path + '/' + files[i]))(self);
		}
	})
	return this;
}