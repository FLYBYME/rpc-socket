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
	fs.writeFile('./data/config.json', JSON.stringify(this.config), function(
			err) {
		if (err)
			throw err;
		callBack()
	});
};
