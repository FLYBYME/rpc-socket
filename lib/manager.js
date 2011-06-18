var fs = require('fs');

var rpc = require('./rpc');

var utils = require('./utils');

var util = require('util');
var events = require('events');

var os = require('./os');

var connections = require('./connection');

var config = require('./config');

var keyGen = utils.keyGen;
Object.prototype.clone = function() {
	var newObj = (this instanceof Array) ? [] : {};
	for (i in this) {
		if (i == 'clone')
			continue;
		if (this[i] && typeof this[i] == "object") {
			newObj[i] = this[i].clone();
		} else
			newObj[i] = this[i];
	}
	return newObj;
};
var createNode = function(info, socket) {
	this.name = info.name;
	this.conn = info.conn;
	this.clients = info.clients;
	this.socket = socket;
};

var node = {
	name : 'bobsNode',
	conn : [ {
		ip : '192.168.0.123',
		port : 43555,
		type : 'websocket'
	}, {
		ip : '192.168.0.123',
		port : 34434,
		type : 'http'
	} ],
	clients : [ 'jim', 'frank' ],
	nodes : [ 'jame', 'joe' ]
};

var Manager = exports.Manager = function() {

	events.EventEmitter.call(this);
	var self = this;
	// not used yet.
	this.routes = {};

	// if is a server this will be an object of servers.
	this.server = null;
	// An object of clients.
	this.client = null;
	this.rpc = new rpc();

	this.types = {
		client : null,
		server : null
	};

	// Attach some events
	this.on('unWrap', this.unWrap).on('wrap', this.wrap).on('rpc', this._rpc);
	this.build();

	var s = this.types.client.ws(80, 'echo.websocket.org');

};

// So will act like an event emitter
util.inherits(Manager, events.EventEmitter);

// Next version this will come.
Manager.prototype.send = function(type, id, data) {
	console.log(id);
	this.types[type].send(id, data);
};
// Next version this will come.
Manager.prototype.broadcast = function(data) {
	this.types.client.broadcast(data);
	this.types.server.broadcast(data);
};
//
Manager.prototype._rpc = function(type, id, routes, data) {
	var self = this;
	data.__ID = id;
	this.rpc.extend(data, function(result) {
		self.emit('wrap', type, id, routes, result);
	});
	return this;
};
/*******************************************************************************
 * Manager.build
 */
Manager.prototype.build = function() {

	var client = this.types.client = new connections.Client([], 'someGreatName!', {});
	var self = this;

	client.on('manager', function(id, data) {
		self.emit('unWrap', 'client', id, data);
	});

	var server = this.types.server = new connections.Server([], 'someGreatName!', {});
	var self = this;
	setInterval(function timmer(){
		console.log('asd')
	}, 1000);
	server.on('manager', function(id, data) {
		self.emit('unWrap', 'server', id, data);
	});
};
/*******************************************************************************
 * Manager.buildServer
 */
Manager.prototype.buildServer = function() {

};

Manager.prototype.unWrap = function(type, id, data) {
	var a = data.split('$wrap$');
	for ( var i = a.length - 1; i >= 0; i--) {
		if (a[i] === '') {
			continue;
		}
		var aa = a[i].split('$wrapEnd$')[0];
		var data = JSON.parse(aa.split('$data$')[1].split('$dataEnd$')[0]);
		var routes = aa.split('$route$')[1].split('$routeEnd$')[0].split('|');
		this.emit('rpc', type, id, routes, data);// line was to long.
	}
};
Manager.prototype.wrap = function(type, id, routes, result) {
	var str = [];
	str.push('$wrap$');

	str.push('$route$' + routes.join('|') + '$routeEnd$');

	str.push('$data$' + JSON.stringify(result) + '$dataEnd$');

	str.push('$wrapEnd$');
	this.send(type, id, str.join(''));
};
