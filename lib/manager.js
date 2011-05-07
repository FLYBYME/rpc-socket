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
	}

	// Attach some events
	this.on('unWrap', this.unWrap).on('wrap', this.wrap).on('rpc', this._rpc);

};

// So will act like an event emitter
util.inherits(Manager, events.EventEmitter);

// Next version this will come.
Manager.prototype.buildRoute = function(to, from) {
	return [ to, from ];
};
// Next version this will come.
Manager.prototype.send = function(type, id, data) {
	this.types[type].send(id, data)
};
// Next version this will come.
Manager.prototype.send = function(type, id, data) {
	this.types[type].send(id, data)
};
//
Manager.prototype._rpc = function(type, id, routes, data) {
	var self = this;
	data.__ID = id;
	this.rpc.extend(data, function(result) {
		self.emit('wrap', type, id, routes, result);
	})
	return this;
};
//
Manager.prototype.buildClient = function() {

	var client = this.types.client = new connections.Client([], 'someGreatName!', {});
	var self = this;

	client.on('manager', function(id, data) {
		self.emit('unWrap', 'client', id, data)
	})

}

Manager.prototype.unWrap = function(type, id, data) {
	var a = data.split('$wrap$')
	for ( var i = a.length - 1; i >= 0; i--) {
		if (a[i] === '') {
			continue;
		}
		var aa = a[i].split('$wrapEnd$')[0]
		var data = JSON.parse(aa.split('$data$')[1].split('$dataEnd$')[0])
		var routes = aa.split('$route$')[1].split('$routeEnd$')[0].split('|')
		this.emit('rpc', type, id, routes, data);// line was to long.
	}
};
Manager.prototype.wrap = function(type, id, routes, result) {
	str.push('$wrap$');

	str.push('$route$' + routes.join('|') + '$routeEnd$');

	str.push('$data$' + JSON.stringify(data) + '$dataEnd$');

	str.push('$wrapEnd$');
	this.send(type, id, str.join(''))
};