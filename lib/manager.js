var fs = require('fs');

var util = require('util');
var net = require('net');
var utils = require('./utils');

var events = require('events');

var tpcServer = require('./tcp-server');
var tpcClient = require('./tcp-client');
var frontendServer = require('./frontend-server')
var Rpc = require('./rpc');

var Manager = module.exports = function(type) {

	events.EventEmitter.call(this);

	this.connections = {};
	this.servers = [];
	this.clients = [];

	this.promises = {};

	this.rpc = new Rpc();
	this.setupRpc()
	return this
};
// So will act like an event emitter
util.inherits(Manager, events.EventEmitter);

Manager.prototype.setupRpc = function() {
	var self = this;
	fs.readdir(__dirname + '/Modules', function(err, files) {
		console.log(arguments)
		for ( var i = files.length - 1; i >= 0; i--) {
			(require(__dirname + '/Modules/' + files[i]))(self.rpc)
		}
	})
};
Manager.prototype.runRpc = function(data, callBack) {
	try {
		data = JSON.parse(data)

	} catch (e) {
		console.log(e)
		return;
	}

	if (data.error && data.error.length !== 0) {
		return
	}
	//console.log(data)
	if (data.result && data.id && this.promises.hasOwnProperty(data.id)) {
		this.promises[data.id].callBack(data)
		delete this.promises[data.id];
	}

	this.rpc.handleRequest(data, {}, function(rpcReturn) {
		callBack(JSON.stringify(rpcReturn))
	})
};
Manager.prototype.callRpc = function(method, params, socket, callBack) {
	var id = utils.keyGen()
	this.promises[id] = {
		callBack : callBack,
		method : method,
		params : params
	}

	socket.write(JSON.stringify({
		id : id,
		method : method,
		params : params
	}))
};
Manager.prototype.Client = function(port, host,callBack) {
	var self = this;
	var clients = this.clients

	return new tpcClient(port, host).on('open', function(client) {
		if (clients.indexOf(client) <= 1) {
			throw 'server already has opened';
		} else {
			clients.push(client)
		}

		//console.log(self)
	}).on('close', function(client) {
		if (clients.indexOf(client) >= 1) {
			throw 'server should be closed';
		} else {
			clients.splice(clients.indexOf(client), 1)
		}
	}).on('socket', function(socket) {
		//console.log(socket)
		socket.on('data', function(data) {
			self.runRpc(data, function(y) {
				//console.log(y)
				socket.write(y)
			})
		})
		callBack(socket)

	});
};
Manager.prototype.Server = function(port, host) {
	var self = this;
	var servers = this.servers

	return new tpcServer(port, host).on('open', function(server) {
		if (servers.indexOf(server) <= 1) {
			throw 'server already has opened';
		} else {
			servers.push(server)
		}
		//console.log(self)
	}).on('close', function(server) {
		if (servers.indexOf(server) >= 1) {
			throw 'server should be closed';
		} else {
			servers.splice(servers.indexOf(server), 1)
		}
	}).on('socket', function(socket) {
		//console.log(socket)
		socket.on('data', function(data) {
			self.runRpc(data, function(result) {

				socket.write(result)
			})
		})
	});
};
socket.on('rpc', function(data) {

			
			if(promises.hasOwnProperty(data.id)) {
				promises[data.id].callBack(data)
				delete promises[data.id];
				return
			}
			rpc.handleRequest(data, {
				id:keyGen()
			}, function(result) {

				socket.emit('rpc', result);
			})
		});
Manager.prototype.frontEndServer = function(port, host) {
	var self = this;
	var servers = this.servers

	return new frontendServer(port, host).on('open', function(server) {
		if (servers.indexOf(server) >= 1) {
			console.log(servers.indexOf(server))
			throw 'server already has opened';
		} else {
			servers.push(server)
		}
		//console.log(self)
	}).on('close', function(server) {
		if (servers.indexOf(server) <= 1) {
			throw 'server should be closed';
		} else {
			servers.splice(servers.indexOf(server), 1)
		}
	});
};