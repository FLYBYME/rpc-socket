var util = require('util');
var events = require('events');
var fs = require('fs');
var events = require('events');
var path = require('path');
var Buffer = require('buffer').Buffer;
var parse = require('url').parse;

var join = path.join;
var basename = path.basename;
var normalize = path.normalize;

var utils = require('./utils-http');

var mime = require('./mime');

var mixin = require('./utils').Mixin;

var Socket = require('./socket');

var Servers = module.exports = function() {

	events.EventEmitter.call(this);

	this.ifaces = [];

	this.sockets = {};

	return this
};
// So will act like an event emitter
util.inherits(Servers, events.EventEmitter);

Servers.prototype.createServer = function(options) {
	options = mixin(options, {
		id : keyGen(),
		root : '/',
		ws : false,
		type : 'tcp'
	});

	if(options.port && options.host && options.type) {
		//throw 'Need host, port and conection type.'
	}
	var type = options.type;
	var port = options.port;
	var host = options.host;
	var server;
	if(type === 'front end server' || type === 'http') {
		server = new this.httpServer()

		server.setRoot(options.root)

		if(options.ws) {//Add a web-socket if needed.
			server.addWs(options.wsSocket)
		}
	}
	if(type === 'tcp') {
		server = new tcpServer(port, host)
	}

	this.newInterface(server)

	return server;
};
Servers.prototype.handleStaticFile = function() {
	options = options || {};
	if(!options.path)
		throw new Error('path required');

	// setup
	var maxAge = options.maxAge || 0, ranges = req.headers.range, head = 'HEAD' == req.method, root = options.root ? normalize(options.root) : null, fn = options.callback, hidden = options.hidden, done;
	var next = function() {
		console.log(arguments)
	}
	// ignore non-GET requests
	if('GET' != req.method && !head)
		return next();

	// parse url
	var url = parse(options.path), path = decodeURIComponent(url.pathname), type;

	// when root is not given, consider .. malicious
	if(!root && ~path.indexOf('..'))
		return utils.forbidden(res);

	// join / normalize from optional root dir
	path = normalize(join(root, path));

	// malicious path
	if(root && 0 != path.indexOf(root))
		return fn ? fn(new Error('Forbidden')) : utils.forbidden(res);

	// index.html support
	if('/' == path[path.length - 1])
		path += 'index.html';

	// "hidden" file
	if(!hidden && '.' == basename(path)[0])
		return next();

	// mime type
	type = mime(path);
	console.log(path)
	fs.stat(path, function(err, stat) {
		// ignore ENOENT
		if(err) {
			if(fn)
				return fn(err);
			return 'ENOENT' == err.code ? next() : next(err);
			// ignore directories
		} else if(stat.isDirectory()) {
			return fn ? fn(new Error('Cannot Transfer Directory')) : next();
		}

		var opts = {};

		// we have a Range request
		if(ranges) {
			ranges = utils.parseRange(stat.size, ranges);
			// valid
			if(ranges) {
				// TODO: stream options
				// TODO: multiple support
				opts.start = ranges[0].start;
				opts.end = ranges[0].end;
				res.statusCode = 206;
				res.setHeader('Content-Range', 'bytes ' + opts.start + '-' + opts.end + '/' + stat.size);
				// invalid
			} else {
				return fn ? fn(new Error('Requested Range Not Satisfiable')) : invalidRange(res);
			}
			// stream the entire file
		} else {
			res.setHeader('Content-Length', stat.size);
			res.setHeader('Cache-Control', 'public, max-age=' + (maxAge / 1000));
			res.setHeader('Last-Modified', stat.mtime.toUTCString());
			res.setHeader('ETag', utils.etag(stat));

			// conditional GET support
			if(utils.conditionalGET(req)) {
				if(!utils.modified(req, res)) {
					return utils.notModified(res);
				}
			}
		}

		// header fields
		if(!res.getHeader('content-type')) {
			var charset = null;
			res.setHeader('Content-Type', type);
		}
		res.setHeader('Accept-Ranges', 'bytes');

		// transfer
		if(head)
			return res.end();

		// stream
		var stream = fs.createReadStream(path, opts);
		stream.pipe(res);

		// callback
		if(fn) {
			function callback(err) {
				done || fn(err);
				done = true
			}

			req.on('close', callback);
			req.socket.on('error', callback);
			stream.on('end', callback);
		}
	});
}
//
Servers.prototype.httpServer = function(options) {

	var self = this;
	options = mixin(options, {
		id : keyGen(),
		request : function(request, response) {
			self.handleStaticFile(request, response, {
				path : parse(request.url).pathname,
				root : options.root
			});
		}
	});

	var server = http.createServer();
	server.id = options.id
	return server.on('request', options.request).on('close', function() {
		self.emit('close', server);
	});
}
Servers.prototype.tcpServer = function(port, host) {
	var self = this;
	options = mixin(options, {
		id : keyGen,
		open : function() {
		},
		close : function() {
		},
		socket : function() {
		}
	});
	if(!options.server || !(options.host && options.port)) {
		return;
	}
	var server = net.createServer().on('connection', options.socket).on('close', options.close)

	server.id = options.id
	return function() {

	}
}
Servers.prototype.ioServer = function(port, host) {
	var self = this;
	options = mixin(options, {
		id : keyGen,
		open : function() {
		},
		close : function() {
		},
		socket : function() {
		}
	});
	if(!options.server || !(options.host && options.port)) {
		return;
	}
	var server = require('socket.io').listen(options.server || options.port).sockets
	server.on('connection', options.socket).on('close', options.close)
	server.id = options.id
	return server
}
Servers.prototype.wsServer = function(options) {

}
Servers.prototype.connect = function(id) {

};
//
Servers.prototype.newSocket = function(socket, iface) {
	socket = new Socket({
		socket : socket
	})
	var id = socket.id

	this.sockets[id] = socket;

	var self = this;
	socket.on('data', function(data) {
	self.emit('data', id, data, iface)
	}).on('close', function() { delete
		self.sockets[id];
	});
}
Servers.prototype.newInterface = function(iface) {
	if(!iface) {
		return;
	}
	var self = this;
	var interfaces = this.ifaces;

	var id = iface.id

	interfaces[id] = socket;
	iface.on('open', function() {
	console.log(interfaces.indexOf(iface))
	if (interfaces.indexOf(iface) >= 1) {
	throw 'server already has opened';
	} else {
	interfaces.push(iface)
	}
	}).on('close', function() {
	var index = interfaces.indexOf(iface)
	if (index <= 1) {
	throw 'server should be closed';
	} else {
	interfaces.splice(index, 1)
	}
	}).on('socket', function(socket) {
		self.newSocket(socket, iface)
	})
}