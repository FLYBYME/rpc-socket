/***
 * Node modules
 */
var events = require('events');
var util = require('util');
var engine = require('engine.io')
/***
 * Local modules
 */
var Module = require('./rpc')
var uuid = require('./utils').uuid

/**
 *
 */

var Server = module.exports = function(options) {
	events.EventEmitter.call(this);
	this.rpc = new Module(function(){}, options.name || 'server')
	this.server = engine.listen(options.port)
	this.server.on('connection', this.onConnection.bind(this));
}
/***
 * Make it an event
 */
util.inherits(Server, events.EventEmitter);

Server.prototype.onConnection = function(socket) {

	function rpcWrite(err, data) {
			console.log(err, data)
		if (err)
			socket.send(JSON.stringify(err))
		else
			socket.send(JSON.stringify(data))
	}

	var rpc = new Module(rpcWrite)
	rpc.functions = this.rpc.functions
	socket.on('message', function(data) {
		rpc.requestEvent(JSON.parse(data), rpcWrite)
	});
}

