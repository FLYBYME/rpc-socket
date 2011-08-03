var events = require('events');

var util = require('util');

var utils = require('./utils');
var mixin = utils.Mixin;
var keyGen = utils.keyGen;

var Socket = module.exports = function(options) {
	events.EventEmitter.call(this);
	options = mixin({
		id : keyGen(),
		isIoSocket : false
	}, options);
	console.log(options)
	if(!options.socket) {
		throw 'Needs options.socket'
	}

	var self = this;
	// Keep track of what needs to be sent.
	this._quota = [];
	// is the socket still sending?
	this._isSending = false;
	// is the socket open?
	this._isOpen = false;
	//if the socket is an socket.io socket.
	this.isIoSocket = options.isIoSocket;

	this.id = options.id;

	this.backLog = [];

	this.socket = options.socket.on('data', function(data) {

	self.handleRequest(data)

	}).on('close', function(data) {

		self.emit('close')

	});
	return this.on('writeData', this.writeData)
};
// So will act like an event emitter
util.inherits(Socket, events.EventEmitter);

Socket.prototype.handleRequest = function(data) {
	if(this.isIoSocket) {
		this.emit('data', data);
		return;
	}
	var a = data.toString('ascii').split(/avxiq9j75jj/)
	var backLog = this.backLog;
	for(var i = a.length - 1; i >= 0; i--) {

		if(/awjz0e9qs74/.test(a[i])) {
			if(a[i] !== '') {
				backLog.push(a[i].split(/awjz0e9qs74/)[0])
				try {
					var obj = JSON.parse(backLog.join(''))
				} catch(e) {
					continue;
				}
				this.emit('data', obj);
				backLog = []
			}
		} else {
			if(a[i] !== '') {
				backLog.push(a[i])
			}

		}
	}

};
Socket.prototype.setID = function(id) {
	this.id = id;
}
Socket.prototype.getID = function() {
	return this.id;
}
Socket.prototype.write = function(data) {

	if(this.isIoSocket) {
		this._quota.push(data);
	} else {
		this._quota.push('avxiq9j75jj' + JSON.stringify(data) + 'awjz0e9qs74');

	}

	this.emit('writeData');

	return this;
};
Socket.prototype.writeData = function() {
	var self = this;

	if(!this._isSending && this._quota.length >= 1) {

		var data = this._quota.shift();

		this._isSending = true;

		if(this.isIoSocket) {

			this.socket.emit('data', data);
			self._isSending = false;
			self.emit('writeData');
		} else {
			this.socket.write(data, function() {
				self._isSending = false;
				self.emit('writeData');
			});
		}

	}
};
Socket.prototype.disconnect = function() {
	this.socket.disconnect()
}