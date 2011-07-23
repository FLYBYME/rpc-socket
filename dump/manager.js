var fs = require('fs');

var util = require('util');
var net = require('net');
var utils = require('./utils');
var keyGen = utils.keyGen;

var events = require('events');

var tpcServer = require('./tcp-server');
var tpcClient = require('./tcp-client');
var frontendServer = require('./frontend-server')
var Rpc = require('./rpc');

var Manager = module.exports = function(type) {

	events.EventEmitter.call(this);

	this.connections = {};
	this.ifaces = [];

	var sockets = this.sockets = {};

	var self = this;

	this.rpc = new Rpc({

	}).on('send', function(id, data) {
		self.write(id, data)
	}).on('disconnect', function(id) {
		var socket = self.getSocket(id)
		if(socket) {
			socket.disconnect()
		}
	}).on('broadcast', function(data) {
		self.broadCast(data)
	});
	
	return this
};
//********************************//

Manager.prototype.write = function(id, data) {
	if(this.sockets.hasOwnProperty(id)) {
		this.sockets[id].write(data);
	}
};
Manager.prototype.broadCast = function(data) {
	var sockets = this.sockets;
	for(var key in sockets) {
		var socket = sockets[key];
		socket.write(data);
	}
};
//********************************//

Manager.prototype.createServer = function(options) {
	console.log(options)
	

}
Manager.prototype.getSocket = function(id) {
	if(this.sockets.hasOwnProperty(id)) {
		return this.sockets[id];
	}
}
Manager.prototype.load = function(modulePath) {
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
		for ( var i = files.length - 1; i >= 0; i--) {
			(require(path+'/' + files[i]))(self.rpc);
		}
	})
}
Manager.prototype.newSocket = function(socket) {
	var rpc = this.rpc;

	var id = keyGen();
	socket.setID(id);
	this.sockets[id] = socket;

	socket.on('data', function() {

	}).on('close', function() {

	}).on('rpc', function(data) {
		
		rpc.handleRequest(data, function(result) {
			socket.write(result,'rpc')
		})
	})
}
Manager.prototype.newInterface = function(iface) {
	var self = this;
	var interfaces = this.ifaces;
	iface.on('open', function() {
		console.log(interfaces.indexOf(iface))
		if (interfaces.indexOf(iface) >= 1) {
			throw 'server already has opened';
		} else {
			interfaces.push(iface)
		}
	}).on('close', function() {
		var index = interfaces.indexOf(iface)
		if (index <= 1) {
			throw 'server should be closed';
		} else {
			interfaces.splice(index, 1)
		}
	}).on('socket', function(socket) {
		self.newSocket(socket)
	})
}
//********************************//
Manager.prototype.tpcClient = function(port, host) {

	return new tpcClient(port, host)
};
Manager.prototype.tpcServer = function(port, host) {

	return new tpcServer(port, host)
};
Manager.prototype.frontEndServer = function(port, host) {

	return new frontendServer(port, host);
};
//********************************//