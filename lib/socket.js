var events = require('events');
var util = require('util');
var utils = require('./utils');
var keyGen = utils.keyGen;

/*
 * Events: rpc, route
 *
 *
 */
var Socket = module.exports = function(socket, format, encode) {
	events.EventEmitter.call(this);
	this.on('dispatch ', this.dispatchData.bind(this))
	this.socket = socket
	this.format = format
	this.id = keyGen()
	socket.setEncoding(encode);
	this.buffer = ''

	socket.on('connect', this.socketConnected.bind(this))
	socket.on('data', this.socketData.bind(this))
	socket.on('end', this.socketEnd.bind(this))
	socket.on('timeout', this.socketTimeout.bind(this))
	socket.on('drain', this.socketDrain.bind(this))
	socket.on('error', this.socketError.bind(this))
	socket.on('close', this.socketClose.bind(this))

}
util.inherits(Socket, events.EventEmitter);
/*
 *
 *
 */
Socket.prototype.dispatchData = function(obj) {

	var date = obj.date;
	var data = obj.data;
	var type = obj.type;
	var id = obj.id;

	switch (type) {
		case 'rpc':
			this.emit('rpc', data)
			break;
		case 'route':
			this.emit('route', data)
			break;
		case 'keepAlive':
		default:
			console.log('default')
	}

}
/*
 *
 *
 */
Socket.prototype.socketConnected = function() {
	this.emit('connect', this);
}
/*
 *
 *
 */
Socket.prototype.write = function(type, data) {

	if(this.socket.store) {
		this.socket.emit('data', data)
	} else {
		if(this.format === 'json') {

			var date = new Date()
			var id = keyGen()
			var result = {
				type : type,
				date : date,
				id : id,
				data : data
			}
			this.socket.write(JSON.stringify(result) + '\n');

		} else if(this.format === 'raw') {
			this.socket.write(data);

		}
	}
}
/*
 *
 *
 */
Socket.prototype.socketData = function(d) {

	if(this.socket.store) {
		this.emit('io', d);
	} else {

		if(this.format === 'json') {

			this.buffer += d;
			var i;
			while(( i = this.buffer.indexOf('\n')) >= 0) {
				var json = this.buffer.slice(0, i);
				this.buffer = this.buffer.slice(i + 1);
				var m = JSON.parse(json);
				//console.log(m)
				this.dispatchData(m)
			}
		} else if(this.format === 'raw') {
			this.emit(this.format, d);
		}
	}
}
/*
 *
 *
 */
Socket.prototype.socketEnd = function() {
	this.emit('close', this);
}
/*
 *
 *
 */
Socket.prototype.socketTimeout = function() {

}
/*
 *
 *
 */
Socket.prototype.socketError = function() {
	this.emit('close', this);
}
/*
 *
 *
 */
Socket.prototype.socketClose = function() {
	this.emit('close', this);
}
/*
 *
 *
 */
Socket.prototype.socketDrain = function() {
	this.emit('drain', this);
}