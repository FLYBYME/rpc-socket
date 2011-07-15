var events = require('events');

var util = require('util');
var Socket = module.exports = function(socket) {
	events.EventEmitter.call(this);
	var self = this;
	// Keep track of what needs to be sent.
	this._quota = [];
	// is the socket still sending?
	this._isSending = false;
	// is the socket open?
	this._isOpen = false;

	this.socket = socket;

	var backLog = [];
	socket.on('data', function(data) {
		var a = data.toString('ascii').split(/avxiq9j75jj/)

		//console.log(a.length)

		for ( var i = a.length - 1; i >= 0; i--) {

			if (/awjz0e9qs74/.test(a[i])) {
				if (a[i] !== '') {
					//console.log(a[i].split(/awjz0e9qs74/).length)
					backLog.push(a[i].split(/awjz0e9qs74/)[0])
					//console.log('is blank'+a[i].split(/awjz0e9qs74/)[0] === '')
					self.emit('data', backLog.join(''));
					backLog = []
				}
			} else {
				//console.log(a[i] === '')
				if (a[i] !== '') {

					backLog.push(a[i])
					//console.log('push')
				}

			}
		}

	});
	this.on('writeData', this.writeData);

	return this
};

// So will act like an event emitter
util.inherits(Socket, events.EventEmitter);

Socket.prototype.write = function(data) {

	this._quota.push(data);

	this.emit('writeData');

	return this;
};

Socket.prototype.writeData = function() {
	var self = this;

	if (!this._isSending && this._quota.length >= 1) {

		var data = this._quota.shift();

		this._isSending = true;
		this.socket.write(data, function() {
			self._isSending = false;
			self.emit('writeData');
		});

	}
	;
};