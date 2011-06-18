var sqlite = require('sqlite');

var events = require('events');

var util = require('util');


var utils = require('./utils');

var keyGen = utils.keyGen;


var Sqlite = modules.exports = function(){
	this.connection = null;
	this.connected = false;
	this.id = keyGen();
	
};
Sqlite.prototype.connect = function(){
	if(!this.connected){
		this.connection = new sqlite.Database();
		this.connected = false;
	}
};
Sqlite.prototype.connect = function(){
	if(!this.connected){
		this.connection = new sqlite.Database();
		this.connected = false;
	}
};
