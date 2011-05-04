var rpc = require('./rpc');

var utils = require('./utils');

var os = require('./os');

var connections = require('./connection');

var config = require('./config');

var keyGen = utils.keyGen

/*-----------------------------------------------
 Client proto
 -----------------------------------------------*/
var Client = exports.Client = function(name, type, ip, port) {
	
	
	this.id = keyGen()
	
	this.name = name;
	this.type = type;
	//
	this.ip = ip;
	this.port = port;
	//
	this.socket = null;
	this.active = true;
	//
	this.rpc = new rpc();
	this.os = new os(60);
	
};