var net = require('net');

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
						response.end(JSON.stringify(new httpResult(id, name,
								err, res)));
					});
				} catch (err) {
					response.writeHead(400, {
						'Content-Type' : 'application/json',
						'Connection' : 'close'
					});
					response.end(JSON.stringify(new httpResult(null, null,
							'Bad Request', null)));
				}

				console.log('end');
			});
		} else {
			response.writeHead(400, {
				'Content-Type' : 'application/json',
				'Connection' : 'close'
			});
			response.end(JSON.stringify(new httpResult(null, null,
					'Bad Request', null)));
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

var clientTcp = exports.clientTcp = function(port, host, options) {

	var self = this;
	// Socket info
	this.port = port;
	this.host = host;

	// Keep track of what needs to be sent.
	this._quota = [];
	this._isSending = false;
	
	// init the socket

	return this;
};

// So will act like an event emitter
util.inherits(clientTcp, events.EventEmitter);

// PUBLICE METHODS----------------------

// when ready connect. maybe not right away.
clientTcp.prototype.connect = function(callBack) {
	this.socket.connect(this.port, this.host, callBack);
	return this;
};
// when ready connect. maybe not right away.
clientTcp.prototype.send = function(obj) {
	this._quota.push(obj)
	return this;
};

// PRIVATE METHODS----------------------

// When message is resived deal with it.
clientTcp.prototype._onData = function(data) {

	var datasplit = data.split('$start$');
	if (!(datasplit.length >= 2 && datasplit[0] === '')) {
		throw new TypeError(data.toString());
	}
	datasplit.shift();

	for ( var i = datasplit.length - 1; i >= 0; i--) {
		try {
			this.emit('data', JSON.parse(datasplit[i].split('$end$')[0]));
		} catch (e) {
			throw new TypeError(data.toString());
		}
	}
};

// When message is resived deal with it.
clientTcp.prototype._onSendData = function(obj) {
	var self = this;
	
	var str = '$start$' + JSON.stringify(obj) + '$end$';
	this._isSending = true;
	this.socket.write(str, function() {
		self._isSending = false;
		self._onDataSent();
	})
};
// When message is resived deal with it.
clientTcp.prototype._onDataSent = function() {
	if(!this._isSending && this._quota.length >== 1){
		var obj = this._quota.shift();
		
		this._onSendData(obj)
		
	}
};

// Setting up the socket.
// Might need to be called more then once.
// IE, On socket close.
clientTcp.prototype._setupSocket = function() {
	var self = this;
	
	
	
	this.socket = net.Stream()

	// set the encoding
	this.socket.setEncoding('utf8')

	this.socket.on('connect', function() {
		console.log('connect');
	}).on('data', function(data) {
		self._onData(data)
	}).on('end', function() {

	}).on('timeout', function() {

	}).on('drain', function() {
		
	}).on('error', function() {

	}).on('close', function() {
		self._setupSocket();
	});

};
