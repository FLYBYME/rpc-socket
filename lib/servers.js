var util = require('util');
var events = require('events');
var fs = require('fs');
var events = require('events');
var path = require('path');
var http = require('http');
var net = require('net');
var Buffer = require('buffer').Buffer;
var parse = require('url').parse;

var join = path.join;
var basename = path.basename;
var normalize = path.normalize;

var utils = require('./utils');
var keyGen = utils.keyGen;
var RPC = require('./rpc');

var mime = utils.Mime;


var mixin = utils.Mixin;

var Socket = require('./socket');

/*******************************************************************************
 * utils.ServerInstance
 */
var ServerInstance = function(server) {
	this.id = keyGen();
	this.server = server;
	events.EventEmitter.call(this);
	return this;
};
// So will act like an event emitter
util.inherits(ServerInstance, events.EventEmitter);


ServerInstance.prototype.listen = function(){
	this.emit('listen')
}
ServerInstance.prototype.load = function(){
	this.rpc = (new RPC);
}
// fs.stat('/home/bob/Sencha-Demo/index.html', function(err, stat)
// {console.log(arguments);})
var Servers = module.exports = function() {

	events.EventEmitter.call(this);

	this.ifaces = {};

	this.sockets = {};

	return this
};
// So will act like an event emitter
util.inherits(Servers, events.EventEmitter);

Servers.prototype.getSocket = function(id) {
	if(this.sockets.hasOwnProperty(id)) {
		return this.sockets[id];
	}
}
Servers.prototype.getSockets = function() {
	return this.sockets
}
Servers.prototype.writeSocket = function(id, data) {
	
	var socket = this.getSocket(id);
	
	if(socket){
		socket.write(data)
		return true;
	}
	
	return false;
}
/*******************************************************************************
 * Servers.httpServer
 */
Servers.prototype.httpServer = function(options) {

	var self = this;
	// init the server from node.
	var server = http.createServer();
	var hookPaths;
	var blackList;
	var newServerInstance = new ServerInstance(server)
	options = mixin({
		request : function(request, response) {
			
			console.log(request.connection.remoteAddress)
			if(hooks.indexOf(request.url) >=0){
				options.hook(request, response, request.url);
				return;
			}
			if(blackList.indexOf(request.connection.remoteAddress) >=0){
				response.end()
				return;
			}
			self.handleStaticFile(request, response, {
				path : request.url,
				root : options.root
			});
		},
		hooks:[],
		hasSocket : false,
		server : server,
		open : function() {
			self.ifaces[newServerInstance.id] = newServerInstance;
			self.emit('open', newServerInstance);
		},
		close : function() {
			delete self.ifaces[newServerInstance.id]
			self.emit('close', newServerInstance);
		}
	}, options);
	
	
	
	hooks = options.hooks
	blackList= options.blackList
	console.log(newServerInstance)
	server.on('request', options.request).on('close', options.close);
	// add a web-socket if needed.options
	if(options.hasSocket) {
		this.ioServer(options)
	}
	server.listen(options.port, options.host, options.open);
	return ServerInstance;
}
/*******************************************************************************
 * Servers.tcpServer
 */
Servers.prototype.tcpServer = function(options) {
	var self = this;
	var server = net.createServer()

	var newServerInstance = new ServerInstance(server)
	options = mixin({
		open : function() {
			self.emit('open', newServerInstance);
		},
		close : function() {
			self.emit('close', newServerInstance);
		},
		socket : function(socket) {
			socket = new Socket({
				socket : socket
			})
			self.sockets[socket.id] = socket.on('close', function() { 
				delete self.sockets[socket.id];
			});
			self.emit('socket', socket);
		}
	}, options);
	if(!(options.host && options.port)) {
		return;
	}
	server.on('connection', options.socket).on('close', options.close)

	
server.listen(options.port, options.host, options.open);
	return newServerInstance;
}
/*******************************************************************************
 * Servers.ioServer
 */
Servers.prototype.ioServer = function(options) {
	var self = this;
	console.log(options)

	console.log('ioServer')
	var server = require('socket.io').listen(options.server || options.port).sockets
	var newServerInstance = new ServerInstance(server)
	options = mixin({
		open : function() {
			self.emit('open', newServerInstance);
		},
		close : function() {
			self.emit('close', newServerInstance);
		},
		socket : function(socket) {
			socket = new Socket({
				socket : socket,
				isIoSocket : true
			})
			self.sockets[socket.id] = socket.on('close', function() { 
				delete self.sockets[socket.id];
			});
			self.emit('socket', socket);
		}
	}, options);

	server.on('connection', options.socket).on('close', options.close)
	console.log(server)
	options.open(newServerInstance);
	return newServerInstance.on('listen', function(){
		
	});
}
/*******************************************************************************
 * Servers.wsServer
 */
Servers.prototype.wsServer = function(options) {

}
/*******************************************************************************
 * From the connect framework. Thanks!!
 */

Servers.prototype.handleStaticFile = function(req, res, options) {
	options = options || {};
	if(!options.path)
		throw new Error('path required');

	var next = function(e) {
		throw e
	}
	var fn = function(e) {
		throw e
	}
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
};
