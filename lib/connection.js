var net = require('net');

var http = require('http');

var WebSocket = require('websocket-client').WebSocket;

var events = require('events');

var util = require('util');

var httpResult = function(id, name, err, res) {
	this.id = name;
	this.name = name;
	this.err = err;
	this.result = res;
	return this;
};
/*-----------------------------------------------
 http server not for cdn.
 -----------------------------------------------*/
var httpServer = exports.httpServer = function(port, ip, callBack) {

	var server = http.createServer(function(request, response) {

		if (request.url.indexOf("favicon") >= 1) {
			response.writeHead(200, {
				'Content-Type' : 'image/x-icon'
			});
			response.end("");
			return;
		}

		if (request.method == 'POST' || request.method == 'OPTIONS') {

			request.setEncoding('utf8');

			console.log('run');

			var data = []
			request.on('data', function(chunk) {
				data.push(chunk)
			});
			request.on('end', function() {
				try {
					data = JSON.parse(data.join(''))
					console.log(data);
					callBack(data, function(id, name, err, res) {
						response.writeHead(err == null ? 200 : 400, {
							'Content-Type' : 'application/json',
							'Connection' : 'close'
						});
						response.end(JSON.stringify(new httpResult(id, name, err, res)));
					});
				} catch (err) {
					response.writeHead(400, {
						'Content-Type' : 'application/json',
						'Connection' : 'close'
					});
					response.end(JSON.stringify(new httpResult(null, null, 'Bad Request', null)));
				}

				console.log('end');
			});
		} else {
			response.writeHead(400, {
				'Content-Type' : 'application/json',
				'Connection' : 'close'
			});
			response.end(JSON.stringify(new httpResult(null, null, 'Bad Request', null)));
		}
	});
	server.listen(port, ip);
	return server;
};
var socketResult = function(id, name, err, res, data) {
	this.id = name;
	this.name = name;
	this.err = err;
	this.result = res;
	this.data = data;

	return this;
}
var socketServer = exports.socketServer = function(port, ip, connect) {
	var self = this;
	this.clientTmpl = function(ip, wtire, message, end) {
		this.ip = ip;
		this.write = wtire;
		this.message = message;
		this.end = end;
		//
		this.info = null;
	};
	var server = this.server = net.createServer(function(socket) {
		//
		socket.setEncoding('utf8');
		//
		socket.setKeepAlive(true, 15000);
		//
		var info = new self.clientTmpl(socket.remoteAddress, function(data) {
			socket.write('$start$' + JSON.stringify(data) + '$end$')
		});
		//

		socket.on('connect', function() {

			connect(info)
		}).on('data', function(data) {
			var datasplit = data.split('$start$')
			datasplit.shift()

			if (typeof (info.message) == 'function') {
				for ( var i = datasplit.length - 1; i >= 0; i--) {
					info.message(JSON.parse(datasplit[i].split('$end$')[0]))
				}
			}
		}).on('end', function() {
			if (typeof (info.end) == 'function') {
				info.end()
			}
		});
	});
	//
	this.server.listen(port, ip);
	console.log(server)
	return this.server;
};

var Server = exports.Server = function() {
	events.EventEmitter.call(this);

	var self = this;
	// Socket info
	this.port = port;
	this.host = host;
	this.type = type;

	this.connectCallBack = null;

	// Keep track of what needs to be sent.
	this._quota = [];
	// is the socket still sending?
	this._isSending = false;
	// is the socket open?
	this._isOpen = false;
	this._setupSocket(false);

	var emitter = new events.EventEmitter;

	this.on('onData', function(data) {
		var a = data.split('$wrap$')
		var t = [];
		var e = [];
		for ( var i = a.length - 1; i >= 0; i--) {
			if (a[i] === '') {
				continue;
			}
			var aa = a[i].split('$wrapEnd$')[0]
			var w = JSON.parse(aa.split('$data$')[1].split('$dataEnd$')[0])
			var r = aa.split('$route$')[1].split('$routeEnd$')[0].split('|')
			this.emit('data', r, w);// line was to long.
		}
	}).on('onSendData', function(obj) {
		var str = [];

		str.push('$wrap$');

		str.push('$route$' + obj.routes.join('|') + '$routeEnd$');

		str.push('$data$' + JSON.stringify(obj.data) + '$dataEnd$');

		str.push('$wrapEnd$');

		this._isSending = true;
		obj.socket.write(str.join(''), function() {
			self._isSending = false;
			self.emit('onDataSent')
		})
	}).on('onDataSent', function() {
		if (!this._isSending && this._quota.length >= 1) {
			var obj = this._quota.shift();

			this.emit('onSendData', obj)

		}
	}).on(
			'setupSocket',
			function() {
				var self = this;

				if (this.type === 'websocket') {

					this.socket = new WebSocket('ws://' + this.host + ':' + this.port + '/');
					this.socket.on(
							'open',
							function() {

								console.log('connect');
								typeof (self.connectCallBack) === 'function' ? self
										.connectCallBack() : self.connectCallBack = null;

								self._isOpen = true;
							}).on('data', function(data) {
						self.emit('onData', data.toString('utf8'));
					}).on('close', function() {
						self._isOpen = false;
						self._isSending = false;
						self.emit('setupSocket', true);
					});

				} else if (this.type === 'tcpsocket') {

					this.socket = net.Stream()
					// set the encoding
					this.socket.setEncoding('utf8')

					this.socket.on('connect', function() {
						console.log('connect');

						self._isOpen = true;
					}).on('data', function(data) {
						self.emit('onData', data)
					}).on('end', function() {

					}).on('timeout', function() {

					}).on('drain', function() {

					}).on('error', function() {

					}).on('close', function() {
						self._isOpen = false;
						self._isSending = false;
						self.emit('setupSocket', true);
					});

					if (doConnect) {
						this.connect(function() {

						});
					}
				}
			})

	return this;
};

// So will act like an event emitter
util.inherits(Server, events.EventEmitter);

// PUBLICE METHODS----------------------

// when ready connect. maybe not right away.
Server.prototype.connect = function(callBack) {
	var self = this;

	if (this.type === 'websocket') {
		this.connectCallBack = callBack
	} else {
		this.socket.connect(this.port, this.host, callBack);
	}
	return this;
};
// when ready connect. maybe not right away.
Server.prototype.send = Client.prototype.write = function(obj) {
	var testobj = {
		routes : [ 'tim', 'bob' ],
		data : {
			d : 'd'
		},
		socket : 32
	}
	this._quota.push(obj)
	this._onDataSent()
	return this;
};

// PRIVATE METHODS----------------------

Server.prototype._setupSocket = function() {

}

/**
 * 
 * @param port
 *            "Port to bind to"
 * @param host
 *            "Ip of the node to connect to"
 * @param type
 *            "What type of connection is it? websocket or tcpsocket and tobe
 *            httpsocket"
 * @param options
 *            "Not used yet"
 * @returns this "So we can chain"
 */
var Client = exports.Client = function(port, host, type, options) {
	events.EventEmitter.call(this);

	var self = this;
	// Socket info
	this.port = port;
	this.host = host;
	this.type = type;

	this.connectCallBack = null;

	// Keep track of what needs to be sent.
	this._quota = [];
	// is the socket still sending?
	this._isSending = false;
	// is the socket open?
	this._isOpen = false;

	// init the socket
	this._setupSocket(false);
	this.on('onData', function(data) {
		var a = data.split('$wrap$')
		var t = [];
		var e = [];
		for ( var i = a.length - 1; i >= 0; i--) {
			if (a[i] === '') {
				continue;
			}
			var aa = a[i].split('$wrapEnd$')[0]
			var w = JSON.parse(aa.split('$data$')[1].split('$dataEnd$')[0])
			var r = aa.split('$route$')[1].split('$routeEnd$')[0].split('|')
			this.emit('data', r, w);// line was to long.
		}
	}).on('onSendData', function(obj) {
		var str = [];

		str.push('$wrap$');

		str.push('$route$' + obj.routes.join('|') + '$routeEnd$');

		str.push('$data$' + JSON.stringify(obj.data) + '$dataEnd$');

		str.push('$wrapEnd$');

		this._isSending = true;
		obj.socket.write(str.join(''), function() {
			self._isSending = false;
			self.emit('onDataSent')
		})
	}).on('onDataSent', function() {
		if (!this._isSending && this._quota.length >= 1) {
			var obj = this._quota.shift();

			this.emit('onSendData', obj)

		}
	}).on(
			'setupSocket',
			function() {
				var self = this;

				if (this.type === 'websocket') {

					this.socket = new WebSocket('ws://' + this.host + ':' + this.port + '/');
					this.socket.on(
							'open',
							function() {

								console.log('connect');
								typeof (self.connectCallBack) === 'function' ? self
										.connectCallBack() : self.connectCallBack = null;

								self._isOpen = true;
							}).on('data', function(data) {
						self.emit('onData', data.toString('utf8'));
					}).on('close', function() {
						self._isOpen = false;
						self._isSending = false;
						self.emit('setupSocket', true);
					});

				} else if (this.type === 'tcpsocket') {

					this.socket = net.Stream()
					// set the encoding
					this.socket.setEncoding('utf8')

					this.socket.on('connect', function() {
						console.log('connect');

						self._isOpen = true;
					}).on('data', function(data) {
						self.emit('onData', data)
					}).on('end', function() {

					}).on('timeout', function() {

					}).on('drain', function() {

					}).on('error', function() {

					}).on('close', function() {
						self._isOpen = false;
						self._isSending = false;
						self.emit('setupSocket', true);
					});

					if (doConnect) {
						this.connect(function() {

						});
					}
				}
			})
	return this;
};

// So will act like an event emitter
util.inherits(Client, events.EventEmitter);

// PUBLICE METHODS----------------------

// when ready connect. maybe not right away.
Client.prototype.connect = function(callBack) {
	var self = this;

	if (this.type === 'websocket') {
		this.connectCallBack = callBack
	} else {
		this.socket.connect(this.port, this.host, callBack);
	}
	return this;
};
// when ready connect. maybe not right away.
Client.prototype.send = Client.prototype.write = function(obj) {
	var testobj = {
		routes : [ 'tim', 'bob' ],
		data : {
			d : 'd'
		}
	}
	this._quota.push(obj)
	this._onDataSent()
	return this;
};

// PRIVATE METHODS----------------------

// When message is resived deal with it.
Client.prototype._onData = function(data) {

	var a = data.split('$wrap$')
	var t = [];
	var e = [];
	for ( var i = a.length - 1; i >= 0; i--) {
		if (a[i] === '') {
			continue;
		}
		var aa = a[i].split('$wrapEnd$')[0]
		this.emit('data', aa.split('$route$')[1].split('$routeEnd$')[0].split('|'), JSON.parse(aa
				.split('$data$')[1].split('$dataEnd$')[0]))
	}
};

// When message is resived deal with it.
Client.prototype._onSendData = function(obj) {
	var self = this;
	var str = [];

	str.push('$wrap$');

	str.push('$route$' + obj.routes.join('|') + '$routeEnd$');

	str.push('$data$' + JSON.stringify(obj.data) + '$dataEnd$');

	str.push('$wrapEnd$');

	this._isSending = true;
	this.socket.write(str.join(''), function() {
		self._isSending = false;
		self._onDataSent();
	})
};
// When message is resived deal with it.
Client.prototype._onDataSent = function() {
	if (!this._isSending && this._quota.length >= 1) {
		var obj = this._quota.shift();

		this._onSendData(obj)

	}
};

// Setting up the socket.
// Might need to be called more then once.
// IE, On socket close.
Client.prototype._setupSocket = function(doConnect) {
	var self = this;

	if (this.type === 'websocket') {

		this.socket = new WebSocket('ws://' + this.host + ':' + this.port + '/');
		this.socket.on(
				'open',
				function() {

					console.log('connect');
					typeof (self.connectCallBack) === 'function' ? self.connectCallBack()
							: self.connectCallBack = null;

					self._isOpen = true;
				}).on('data', function(data) {
			self._onData(data.toString('utf8'))
		}).on('close', function() {
			self._isOpen = false;
			self._isSending = false;
			self._setupSocket(true);
		});

	} else if (this.type === 'tcpsocket') {

		this.socket = net.Stream()
		// set the encoding
		this.socket.setEncoding('utf8')

		this.socket.on('connect', function() {
			console.log('connect');

			self._isOpen = true;
		}).on('data', function(data) {
			self._onData(data)
		}).on('end', function() {

		}).on('timeout', function() {

		}).on('drain', function() {

		}).on('error', function() {

		}).on('close', function() {
			self._isOpen = false;
			self._isSending = false;
			self._setupSocket(true);
		});

		if (doConnect) {
			this.connect(function() {

			});
		}
	}
};
