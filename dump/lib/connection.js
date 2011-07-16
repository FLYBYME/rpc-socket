var net = require('net');

var http = require('http');

var events = require('events');

var util = require('util');

var WebSocketClient = require('websocket-client').WebSocket;

var WebSocketServer = require("websocket-server");

var utils = require('./utils');

var keyGen = utils.keyGen;

var httpResult = function(id, name, err, res) {
	this.id = name;
	this.name = name;
	this.err = err;
	this.result = res;
	return this;
};

/*******************************************************************************
 * Connection
 */
var Connection = exports.Connection = function(socket) {
	events.EventEmitter.call(this);

	this.id = socket.__ID;
	// Keep track of what needs to be sent.
	this._quota = [];
	// is the socket still sending?
	this._isSending = false;
	// is the socket open?
	this._isOpen = false;

	this.socket = socket;

	this.on('write', this.write).on('_writeData', this._writeData);
};

// So will act like an event emitter
util.inherits(Connection, events.EventEmitter);

Connection.prototype.write = function(data) {
	this._quota.push(data);
	this.emit('_writeData');
	return this;
};

Connection.prototype._writeData = function() {
	var self = this;
	if (!this._isSending && this._quota.length >= 1) {
		var data = this._quota.shift();

		this._isSending = true;
		this.socket.write(data, function() {
			self._isSending = false;
			self.emit('_writeData');
		});

	}
	;
};

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
var Server = exports.Server = function(hosts, name, options) {
	events.EventEmitter.call(this);

	var self = this;

	// Keep track of what needs to be sent.
	this._quota = [];
	// is the socket still sending?
	this._isSending = false;
	// is the socket open?
	this._isOpen = false;
	this.sockets = {};
	this.servers = {};
	this.on('socket', function(socket) {

		if (!this.sockets.hasOwnProperty(socket.__ID)) {
			this.sockets[socket.__ID] = new Connection(socket);
		} else {
			throw new Error('Socket is already been used!');
		}
	}).on('socketData', function(id, data) {
		// maybe do some logging?
		this.emit('manager', id, data);
	}).on('socketClose', function(socket) {
		if (this.sockets.hasOwnProperty(socket.__ID)) {
			delete this.sockets[socket.__ID];
		} else {
			throw new Error('No such socket been closed!');
		}
	});
	// server events
	this.on('server', function(server) {
		if (!this.servers.hasOwnProperty(server.__ID)) {
			this.servers[server.__ID] = server;
		} else {
			throw new Error('Socket is already been used!');
		}
	}).on('serverClose', function(server) {
		if (this.servers.hasOwnProperty(server.__ID)) {
			delete this.servers[server.__ID];
		} else {
			throw new Error('No such socket been closed!');
		}
	});

	return this;
};

// So will act like an event emitter
util.inherits(Server, events.EventEmitter);

// PUBLICE METHODS----------------------

// when ready connect. maybe not right away.
Server.prototype.send = Server.prototype.write = function(id, data) {

	if (this.sockets.hasOwnProperty(id)) {
		this.sockets[id].write(data);
	} else {
		throw new Error('No socket with such id!');
	}
	return this;
};

Server.prototype.ws = function(port) {
	var self = this;

	var server = WebSocketServer.createServer();

	server.__ID = keyGen();

	server.on("connection", function(socket) {
		socket.__ID = keyGen();

		self.emit('socket', socket);

		socket.on("message", function(data) {
			self.emit('socketData', socket.__ID, data);
		}).on('close', function(data) {
			self.emit('socketClose', socket);
		});
	}).on("close", function(data) {
		self.emit('serverClose', server);
	});
	server.listen(port);
	this.emit('server', server);
};

Server.prototype.http = function(port, host) {

	var server = http.createServer();
	var self = this;
	server.on('request', function(request, response) {
		if (request.url.indexOf("favicon") >= 1) {
			response.writeHead(200, {
				'Content-Type' : 'image/x-icon'
			});
			response.end("");
			return;
		} else if (request.method === "POST") {

			request.setEncoding('utf8');

			var data = [];

			if (!request.headers.hasOwnProperty('RPC-KEY-Node')) {
				var socket = {
					__ID : keyGen(),
					write : function() {

					}
				}
				response.writeHead(400, {
					'Content-Type' : 'application/json',
					'Connection' : 'close',
					'RPC-KEY-Node' : keyGen()
				});
				response.end("");
			} else {

				request.on('data', function(chunk) {
					data.push(chunk);
				});
				request.on('end', function() {
					self.emit('socketData', socket.__ID, data);
				})
			}
		}
	}).listen(port, host || '127.0.0.1', function() {
		self.emit('server', server);
	});
};

Server.prototype.tcp = function(port) {
	var self = this;
	var server = net.createServer(function(socket) {

		socket.setEncoding('utf8');
		// set id.
		socket.__ID = keyGen();

		self.emit('socket', socket);

		socket.on('data', function(data) {
			self.emit('socketData', socket.__ID, data);
		}).on('close', function(data) {
			self.emit('socketClose', socket);
		});
	}).on("close", function(data) {
		self.emit('serverClose', server);
	});

	server.__ID = keyGen();

	server.listen(port);
	this.emit('server', server);

};

Server.prototype.broadcast = function(data) {

	var sockets = this.sockets;
	for ( var key in sockets) {
		sockets[key].write(data);
	}
	;
};

Server.prototype.keys = function() {
	return Object.keys(this.sockets);
};

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
var Client = exports.Client = function(hosts, name, options) {
	events.EventEmitter.call(this);

	var self = this;

	// Keep track of what needs to be sent.
	this._quota = [];
	// is the socket still sending?
	this._isSending = false;
	// is the socket open?
	this._isOpen = false;
	this.sockets = {};
	
	
	this.on('socket', function(socket) {

		if (!self.sockets.hasOwnProperty(socket.__ID)) {
			self.sockets[socket.__ID] = new Connection(socket);
		} else {
			throw new Error('Socket is already been used!');
		}
	}).on('socketData', function(id, data) {
		// maybe do some logging?
		this.emit('manager', id, data);
	}).on('socketClose', function(socket) {
		if (self.sockets.hasOwnProperty(socket.__ID)) {
			delete self.sockets[socket.__ID];
		} else {
			throw new Error('No such socket been closed!');
		}
	});

	return this;
};

// So will act like an event emitter
util.inherits(Client, events.EventEmitter);

// PUBLICE METHODS----------------------

// when ready connect. maybe not right away.
Client.prototype.send = Client.prototype.write = function(id, data) {
	console.log(id);
	if (this.sockets.hasOwnProperty(id)) {
		this.sockets[id].write(data);
	} else {
		throw new Error('No socket with such id!');
	}
	return this;
};

Client.prototype.ws = function(port, host) {
	var self = this;

	var socket = new WebSocketClient('ws://' + host + ':' + port + '/');
	// set the id.
	socket.__ID = keyGen();
	socket.on('open', function() {
		console.log(socket);
		self.emit('socket', socket);
	}).on('data', function(data) {

		console.log(data);
		self.emit('socketData', socket.__ID, data.toString('utf8'));
	}).on('close', function() {
		self.emit('close', socket);
	});
	return socket;
};

Client.prototype.poll = function(port, host) {
	var d = null;
	var c = null;
	var t = 0;
	var self = this;
	var socket = {
		write : function(data, callBack) {
			c = callBack;
			d = data;
		},
		__ID : keyGen()
	};
	var pollObject = {};
	var p = function() {
		self.http(port, host, d === null ? pollObject : d, function() {
			c === null ? null : c();
			c = null;
			d = null;
			p();
		});
	};
	p();

};

Client.prototype.http = function(port, host, data, url, callBack) {
	var self = this;
	if (typeof (url) === 'function') {
		callBack = url;
		url = 'http://' + host + ':' + port + '/rpc';
	}

	var httpClient = http.createClient(port, host);

	var request = httpClient.request('POST', url, {
		'Time' : new Date(),
		'Host' : host + ':' + port,
		'X-Requested-With' : 'rpc-socket'
	});

	request.on('response', function(response) {

		var page = [];

		response.setEncoding('utf8');

		response.on('data', function(chunk) {

			page.push(chunk);

		});

		response.on('end', function() {
			callBack(page.join(''));
		});
	});

	request.end(JSON.stringify(data), 'utf8');
};

Client.prototype.tcp = function(port, host, callBack) {
	var self = this;
	var socket = net.Stream();
	// set the id.
	socket.__ID = keyGen();

	// set the encoding
	socket.setEncoding('utf8');
	// add the events
	socket.on('connect', function() {
		self.emit('socket', socket);
	}).on('data', function(data) {
		self.emit('socketData', socket.__ID, data);
	}).on('end', function() {

	}).on('timeout', function() {

	}).on('drain', function() {

	}).on('error', function() {

	}).on('close', function() {
		self.emit('socketClose', socket);
	}).connect(port, host, function() {
		// callBack(socket)
	});
};

Client.prototype.broadcast = function(data) {

	var sockets = this.sockets;
	for ( var key in sockets) {
		sockets[key].write(data);
	}
	;
};

Client.prototype.keys = function() {
	return Object.keys(this.sockets);
};

// PUBLICE METHODS----------------------

// when ready connect. maybe not right away.
Client.prototype._writeData = function() {

};