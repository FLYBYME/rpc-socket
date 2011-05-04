var fs = require('fs');

var rpc = require('./rpc');

var utils = require('./utils');

var os = require('./os');

var connections = require('./connection');

var config = require('./config');

var keyGen = utils.keyGen;

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

var manager = function() {

	this.nodes = {};

};

manager.prototype._update = function() {

};