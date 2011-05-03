var rpc = require('./rpc');

var utils = require('./utils');

var os = require('./os');

var connections = require('./connection');

var config = require('./config');

var keyGen = utils.keyGen

/*-----------------------------------------------
 Client proto
 -----------------------------------------------*/
var client = exports.client = function(name, type, ip, port) {
	this.name = name;
	this.type = type;
	//
	this.ip = ip;
	this.port = port;
	//
	this.conn = null;
	this.socket = null;
	this.active = true;
	this.promises = {}
	//
	this.rpc = new rpc();
	this.os = new os(60);

	//
	this.nodeList = {};
	this.clientList = {};
	//
	this.buildRpc()
	this.build()
};
client.prototype.write = function(data, callBack) {
	if(data.hasOwnProperty('id') && data.hasOwnProperty('method')) {
		if(!this.promises.hasOwnProperty(data.id)) {
			this.promises[data.id] = callBack
			this.conn.write(data)
		} else {
			throw Error('Same id been used for a client write.')
		}
	}
}
client.prototype.build = function() {
	var self = this;
	this.socket = new connections.clientTcp(this.port, this.ip, function(conn) {
		self.conn = conn;
		conn.message = function(data) {
			if(data.hasOwnProperty('result') && data.hasOwnProperty('id') && self.promises.hasOwnProperty(data.id)) {

				self.promises[data.id](data)
				delete self.promises[data.id];
				return;
			}
			self.rpc.extend(data, function(result) {

				conn.write(result)
			})
		};
		conn.end = function() {

		};
		self.write({
			id:keyGen(),
			method:'list',
			params:[]
		}, function(a) {
			console.log('a')
			console.log(a)
		})
		self.write({
			id:keyGen(),
			method:'client.logon',
			params:[config.auth.key, self.name, {
				name:self.name,
				os:self.os,
				ip:self.ip,
				active:self.active
			}]
		}, function(result) {
			if(result.error){
				throw Error('RPC error:'+ result.error.error + ' CODE: ' +result.error.code)
			}
			console.log(result)
		})
	})
}
client.prototype.buildRpc = function() {
	var self = this;
	this.rpc.on('client', {
		auth: function() {
			this.result(true).send();
			self.write({
				id:keyGen(),
				method:'client.logon',
				params:[config.key, self.name, self]
			}, function(a) {
				console.log(a)
			})
		}
	}).on('update', {
		routes: function() {
			this.result(true).send();
			
		}
	})
}