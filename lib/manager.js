var fs = require('fs');

var util = require('util');
var net = require('net');
var utils = require('./utils');

var events = require('events');

var Server = require('./server');
var Client = require('./client');

var Rpc = require('./rpc');
var www = new Rpc()
console.log(www)
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

Manager.prototype.setupRpc = function(data, callBack) {
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
	if (data.error) {
		return
	}
	if (data.results && data.id && this.promises.hasOwnProperty(data.id)) {
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

Manager.prototype.Client = function() {
	var self = this;
	var clients = this.clients

	new Client(null, null).on('open', function(client) {
		if (clients.indexOf(client) <= 1) {
			throw 'server already has opened';
		} else {
			clients.push(client)
		}

		
		console.log(self)
	}).on('close', function(client) {
		if (clients.indexOf(client) >= 1) {
			throw 'server should be closed';
		} else {
			clients.splice(clients.indexOf(client), 1)
		}
	}).on('socket', function(socket) {
		console.log(socket)
		socket.on('data', function(data) {
			console.log(data)
		})
		self.callRpc('list', [], socket, function(y) {
			console.log(y)
		})
		self.callRpc('sysinfo', [], socket, function(y) {
			console.log(y)
		})
	});
};

Manager.prototype.Server = function() {
	var self = this;
	var servers = this.servers

	new Server(null, null).on('open', function(server) {
		if (servers.indexOf(server) <= 1) {
			throw 'server already has opened';
		} else {
			servers.push(server)
		}
		console.log(self)
	}).on('close', function(server) {
		if (servers.indexOf(server) >= 1) {
			throw 'server should be closed';
		} else {
			servers.splice(servers.indexOf(server), 1)
		}
	}).on('socket', function(socket) {
		console.log(socket)
		socket.on('data', function(data) {
			console.log(data)
			self.runRpc(data, function(y) {
				console.log('y')
				socket.write(y)
			})
		})
	});

};
