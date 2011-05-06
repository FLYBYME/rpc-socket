var fs = require('fs');

var rpc = require('./rpc');

var utils = require('./utils');

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
			newObj[i] = this[i]
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
}

var manager = function(name, type) {

	this.name = name;
	this.type = type;
	this.nodes = {};
	this.clients = {};
	this.config = null;
};

manager.prototype._clone = function(data) {
	var newObj = (data instanceof Array) ? [] : {};
	for (i in data) {
		if (i == 'clone')
			continue;
		if (data[i] && typeof data[i] == "object") {
			newObj[i] = this._clone(data[i]);
		} else
			newObj[i] = data[i]
	}
	return newObj;
}

manager.prototype._routeSend = function(route, data) {
	var ourRoute = this._clone(route);

}

manager.prototype._routeReceive = function(route, data) {
	var ourRoute = this._clone(route);
	if (route.length === 4) {
		var from = route[0];
		var nodeSend = route[1];
		var nodeResev = route[2];
		var to = route[3];

		if (nodeResev == this.name) {

			if (this.cleints.hasOwnProperty(to)) {

				this.clients[to].socket.write({
					routes : route,
					data : data
				})

			} else {
				throw new Error('Sent to wrong node.')
			}

		} else if (nodeSend == this.name) {

			if (this.nodes.hasOwnProperty(nodeResev)) {
				this.nodes[nodeResev].socket.write({
					routes : route,
					data : data
				})
			} else {
				throw new Error('No such node to send to.')
			}
		}
	} else if (route.length === 2) {
		var from = route[0];
		var to = route[1];
		if (to === this.name) {

		} else {
			throw new Error('Route length is all wrong.')
		}

	} else {
		throw new Error('Route length is all wrong.')
	}

}

manager.prototype._loadConfig = function(callBack) {
	var self = this;
	fs.readFile('./data/config.json', function(err, data) {
		if (err)
			throw err;
		callBack(self.config = JSON.parse(data))
	});
};
manager.prototype._saveConfig = function(callBack) {
	var self = this;
	fs.writeFile('./data/config.json', JSON.stringify(this.config), function(err) {
		if (err)
			throw err;
		callBack()
	});
};

var Manager = function() {

	events.EventEmitter.call(this);

	this.routes = {}
	this.sockets = {}
	this.on('unWrap', this.unWrap).on('wrap', this.wrap);

};

// So will act like an event emitter
util.inherits(Manager, events.EventEmitter);

Manager.prototype.addRoute = function(route) {

};

Manager.prototype.inComingRoute = function(route, data) {

};

Manager.prototype.newSocket = function(options) {

	var socket = null;
	var self = this;
	if (options.type === 'server') {
		if (options.protocol === 'tcp') {

		} else if (options.protocol === 'ws') {

		} else if (options.protocol === 'http') {

		} else {
			throw new Error('protocol type is wrong.')
		}

	} else if (options.type === 'client') {
		if (options.protocol === 'tcp') {
			socket = new connections.Client(options.port, options.host, 'tcpsocket')
		} else if (options.protocol === 'ws') {
			socket = new connections.Client(options.port, options.host, 'websocket')
		} else if (options.protocol === 'http') {
			socket = new connections.Client(options.port, options.host, 'httpsocket')
		} else {
			throw new Error('protocol type is wrong.')
		}
	} else {
		throw new Error('options type is wrong.')
	}

	if (socket) {
		socket.on('data', function(data) {
			self.emit('unWrap', data);
		});
		socket.connect(function() {

		});

		return socket
	} else {
		throw new Error('Somthing wrong with setting up the socket.')
	}
}

manager.prototype._clone = function(data) {
	var newObj = (data instanceof Array) ? [] : {};
	for (i in data) {
		if (i == 'clone')
			continue;
		if (data[i] && typeof data[i] == "object") {
			newObj[i] = this._clone(data[i]);
		} else
			newObj[i] = data[i]
	}
	return newObj;
};

Manager.prototype.unWrap = function() {
	var a = data.split('$wrap$')
	var t = [];
	var e = [];
	for ( var i = a.length - 1; i >= 0; i--) {
		if (a[i] === '') {
			continue;
		}
		var aa = a[i].split('$wrapEnd$')[0]
		var w = JSON.parse(aa.split('$data$')[1].split('$dataEnd$')[0])
		var r = aa.split('$route$')[1].split('$routeEnd$')[0].split('|')
		// this.emit('data', r, w);// line was to long.
	}
};
Manager.prototype.wrap = function(obj) {
	str.push('$wrap$');

	str.push('$route$' + obj.routes.join('|') + '$routeEnd$');

	str.push('$data$' + JSON.stringify(obj.data) + '$dataEnd$');

	str.push('$wrapEnd$');

};