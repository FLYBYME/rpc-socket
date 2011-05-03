var net = require('net');

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

	var server = http.createServer( function(request, response) {

		if(request.url.indexOf("favicon") >= 1 ) {
			response.writeHead(200, {
				'Content-Type': 'image/x-icon'
			});
			response.end("");
			return;
		}

		if(request.method == 'POST' || request.method == 'OPTIONS') {

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
							'Content-Type': 'application/json',
							'Connection': 'close'
						});
						response.end(JSON.stringify(new httpResult(id, name, err, res)));
					});
				} catch(err) {
					response.writeHead(400, {
						'Content-Type': 'application/json',
						'Connection': 'close'
					});
					response.end(JSON.stringify(new httpResult(null, null, 'Bad Request', null)));
				}

				console.log('end');
			});
		} else {
			response.writeHead(400, {
				'Content-Type': 'application/json',
				'Connection': 'close'
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
var socketServer = exports.socketServer  = function(port, ip, connect) {
	var self = this;
	this.clientTmpl = function(ip, wtire, message, end) {
		this.ip = ip;
		this.write = wtire;
		this.message = message;
		this.end = end;
		//
		this.info = null;
	};
	var server = this.server = net.createServer( function (socket) {
		//
		socket.setEncoding('utf8');
		//
		socket.setKeepAlive(true, 15000);
		//
		var info = new self.clientTmpl(socket.remoteAddress, function(data) {
			socket.write('$start$'+JSON.stringify(data)+'$end$')
		});
		//

		socket.on('connect', function() {
			
		connect(info)
		}).on('data', function(data) {
			var datasplit = data.split('$start$')
			datasplit.shift()

			if(typeof(info.message) == 'function') {
				for (var i = datasplit.length - 1; i >= 0; i--) {
					info.message(JSON.parse(datasplit[i].split('$end$')[0]))
				}
			}
		}).on('end', function() {
			if(typeof(info.end) == 'function') {
				info.end()
			}
		});
	});
	//
	this.server.listen(port, ip);
	console.log(server)
	return this.server;
}
var clientTcp = exports.clientTcp = function(port, ip, connect) {

	var self = this;
	this.clientTmpl = function(ip, wtire, message, end) {
		this.ip = ip;
		this.write = wtire;
		this.message = message;
		this.end = end;
		//
		this.info = null;
	};
	var socket = this.socket = net.Stream()
	this.socket.setEncoding('utf8')
	var info = new this.clientTmpl(socket.remoteAddress, function(data) {
		socket.write('$start$'+JSON.stringify(data)+'$end$')
	});
	this.socket.on('connect', function() {
		console.log('connect')
		connect(info)
	}).on('data', function(data) {
		var datasplit = data.split('$start$')
		datasplit.shift()

		if(typeof(info.message) == 'function') {
			for (var i = datasplit.length - 1; i >= 0; i--) {
				info.message(JSON.parse(datasplit[i].split('$end$')[0]))
			}
		}
	}).on('end', function() {
		if(typeof(info.end) == 'function') {
			info.end()
		}
	});
	this.socket.connect(port, ip);

	console.log(socket)
	return this.socket;
};