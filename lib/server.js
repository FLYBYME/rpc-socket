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
	this.rpc = new Module(function() {
	}, options.name || 'server')

	if (options.server)
		this.server = engine.attach(options.server)
	else
		this.server = engine.listen(options.port)

	this.server.on('connection', this.onConnection.bind(this));
	this.auth = options.auth

}
/***
 * Make it an event
 */
util.inherits(Server, events.EventEmitter);

Server.prototype.blank = function() {

}

Server.prototype.onConnection = function(socket) {
	var self = this
	function rpcWrite(err, data) {
		if (err)
			socket.send(JSON.stringify(err))
		else
			socket.send(JSON.stringify(data))
	}

	var rpc = new Module(rpcWrite)
	function onmessage(data) {
		console.log(data)
		rpc.requestEvent(JSON.parse(data), rpcWrite)
	}

	if (this.auth) {
		rpc.expose('auth', function(user, pass) {
			var exposed = this
			self.auth(user, pass, function(err, user) {
				if (err) {
					exposed.error(err)
					process.nextTick(function() {
						socket.removeListener('message', onmessage);
					})
				} else if (!user) {

					exposed.error(new Error('no auth'))
					process.nextTick(function() {
						socket.removeListener('message', onmessage);
					})
				} else {
					rpc.user = user
					rpc.functions = self.rpc.functions
					exposed.send(user)
				}
			})
		})
	} else {
		rpc.functions = self.rpc.functions
	}
	socket.on('message', onmessage);
	socket.on('open', function() {
		self.emit('open', rpc)
	})
	socket.on('close', function() {
		self.emit('close', rpc)
		rpc.write = self.balnk
	})
	socket.on('error', function(error) {
		self.emit('error', error, rpc)
	})
}

