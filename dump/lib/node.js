var http = require('http');

var net = require('net');

var ws = require("websocket-server");

var rpc = require('./rpc');

var utils = require('./utils');

var os = require('./os');

var connections = require('./connection');

var config = require('./config');

var keyGen = utils.keyGen

var clientTmpl = function(ip, wtire, message) {
	this.ip = ip;
	this.write = wtire;
	this.message = message;
	this.info = null;
}
var node = module.exports = function(name ,type, ip, port) {
	//
	this.name = name;
	this.type = type;
	this.ip = ip;
	this.port = port;
	//
	this.routeServerPort = 43098;
	//
	this.promises = {}
	//
	this.server = null;
	this.routeServer = null;
	//
	this.nodeList = {};
	this.clientList = {};
	this.clients = {};
	//
	var self = this;
	//

	this.write = function(data, callBack) {
		if(data.hasOwnProperty('id') && data.hasOwnProperty('method')) {
			if(!self.promises.hasOwnProperty(data.id)) {
				self.promises[data.id] = callBack
				write(data)
			} else {
				throw Error('Same id been used for a client write.')
			}
		}
	}
	//
	this.rpc = new rpc();
	this.os = new os(60);
	//
	this.buildRpc()
	//
	this.build()

};
node.prototype.build = function() {
	var self = this;
	if(this.type == 'socket') {
		this.server = new connections.socketServer(this.port, this.ip, function(conn) {

			conn.message = function(data) {
				if(data.hasOwnProperty('result') && data.hasOwnProperty('id') && self.promises.hasOwnProperty(data.id)) {

					self.promises[data.id](data)
					delete self.promises[data.id];
					return;
				}
				console.log(data)
				self.rpc.extend(data, function(result) {
					conn.write(result)
				})
			};
			conn.end = function() {

				if(self.clients[conn.ip].hasOwnProperty('name')) {

					delete self.clientList[self.clients[conn.ip].name];
				}
				
				delete self.clients[conn.ip]
			};
			self.clients[conn.ip] = conn;

			console.log(self)
		})
	}
}
node.prototype.buildBackHaul = function() {
	
	
	
	
	this.routeServer = new connections.socketServer(this.routeServerPort, this.ip, function(conn) {

		conn.message = function(data) {

		};
		conn.end = function() {
			
		};

	})
}
node.prototype.buildRpc = function() {
	var self = this;
	this.rpc.on('client', {
		'logon': function(key, name, client) {
			if(!(key && name && client && client.ip)) {
				this.error({
					error:'Missing param',
					code:3
				}).send()
			} else {
				if(key == config.auth.key) {
					if(!self.clientList.hasOwnProperty(name)) {

						self.clientList[name] = client;
						self.clients[client.ip].name = name;
						this.result({
							name:self.name,
							os:self.os
						}).send()
					} else {
						this.error({
							error:'Name taken.',
							code:0
						}).send()
					}
				} else {

					this.error({
						error:'Key wrong',
						code:1
					}).send()
				}
			}
		},
		'logoff': function(name) {
			if(!(key && name && client)) {
				this.error({
					error:'Missing param',
					code:3
				}).send()
			} else {
				if(self.clientList.hasOwnProperty(name)) {
					delete self.clientList[name];
					this.result(true).send();
				} else {
					this.error({
						error:'Name not registered.',
						code:2
					}).send();
				}
			}
		},
		'active': function(name) {
			if(!(name)) {
				this.error({
					error:'Missing param',
					code:3
				}).send()
			} else {
				if(self.clientList.hasOwnProperty(name)) {
					self.clientList[name].active = true;
					this.result(true).send();
				} else {
					this.error({
						error:'Name not registered.',
						code:2
					}).send();
				}
			}
		},
		'notActive': function(name) {
			if(!(name)) {
				this.error({
					error:'Missing param',
					code:3
				}).send()
			} else {
				if(self.clientList.hasOwnProperty(name)) {
					self.clientList[name].active = false;
					this.result(true).send();
				} else {
					this.error({
						error:'Name not registered.',
						code:2
					}).send();
				}
			}
		},
		'clientList': function(name) {
			if(!(name)) {
				this.error({
					error:'Missing param',
					code:3
				}).send()
			} else {
				if(self.clientList.hasOwnProperty(name)) {
					this.result(clientList).send();
				} else {
					this.error({
						error:'Name not registered.',
						code:2
					}).send();
				}
			}

		},
		'nodeList': function(name) {
			if(!(name)) {
				this.error({
					error:'Missing param',
					code:3
				}).send()
			} else {
				if(self.clientList.hasOwnProperty(name)) {
					this.result(nodeList).send();
				} else {
					this.error({
						error:'Name not registered.',
						code:2
					}).send();
				}
			}
		}
	});
	

};