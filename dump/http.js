var http = require('http');

var util = require('util');

var events = require('events');

var fs = require('fs');

var path = require('path');

var join = path.join;

var basename = path.basename;

var normalize = path.normalize;

var utils = require('./utils-http');

var keyGen = require('./utils').keyGen;

var Buffer = require('buffer').Buffer;

var parse = require('url').parse;

var mime = require('./mime');

var Server = module.exports = function(port, host) {

	events.EventEmitter.call(this);

	// config info
	this.port = port;
	this.host = host;

	this.hadSocket = true;
	this.isOpen = false;

	this.server;
	this.socket;
	this.root = '/';
	this.pathKeys = [];
	this.pathInfo = [];
	this.rpc = new Rpc;

	this.build()
	//this.setupRpc()
	return this
};
// So will act like an event emitter
util.inherits(Server, events.EventEmitter);

Server.prototype.setRoot = function(val) {
	this.root = val;
};
Server.prototype.connect = function() {
	var self = this;
	this.server.listen(this.port, this.host, function() {
		self.isOpen = true;
		self.emit('open', self.server);
	});
};
Server.prototype.addWs = function(ws) {
	if(!ws && !ws.on) {
		return;
	}
	var self = this;
	this.socket = ws.on('open', function(server) {
		self.emit('close', server);
	}).on('socket', function(socket) {
		self.emit('socket', socket);
	}).on('close', function(server) {
		self.emit('close', server);
	});
};
Server.prototype.build = function() {

	var self = this;

	var server = this.server = http.createServer();

	server.on('request', function(request, response) {
		self.send(request, response, {
			path : parse(request.url).pathname,
			root : self.root
		});
	}).on('close', function() {
		self.emit('close', server);
	});
};
Server.prototype.send  = function(req, res, options) {
	options = options || {};
	if (!options.path)
		throw new Error('path required');

	// setup
	var maxAge = options.maxAge || 0;
	var ranges = req.headers.range
	var head = 'HEAD' == req.method
	var root = options.root ? normalize(options.root) : null, fn = options.callback
	var hidden = options.hidden
	var done;
	
	
	var next = function() {
		console.log(arguments)
	}
	// ignore non-GET requests
	if ('GET' != req.method && !head)
		return next();

	// parse url
	var url = parse(options.path), path = decodeURIComponent(url.pathname), type;

	// when root is not given, consider .. malicious
	if (!root && ~path.indexOf('..'))
		return utils.forbidden(res);

	// join / normalize from optional root dir
	path = normalize(join(root, path));

	// malicious path
	if (root && 0 != path.indexOf(root))
		return fn ? fn(new Error('Forbidden')) : utils.forbidden(res);

	// index.html support
	if ('/' == path[path.length - 1])
		path += 'index.html';

	// "hidden" file
	if (!hidden && '.' == basename(path)[0])
		return next();

	// mime type
	type = mime(path);
	console.log(path)
	fs.stat(path, function(err, stat) {
		// ignore ENOENT
		if (err) {
			if (fn)
				return fn(err);
			return 'ENOENT' == err.code ? next() : next(err);
			// ignore directories
		} else if (stat.isDirectory()) {
			return fn ? fn(new Error('Cannot Transfer Directory')) : next();
		}

		var opts = {};

		// we have a Range request
		if (ranges) {
			ranges = utils.parseRange(stat.size, ranges);
			// valid
			if (ranges) {
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
			if (utils.conditionalGET(req)) {
				if (!utils.modified(req, res)) {
					return utils.notModified(res);
				}
			}
		}

		// header fields
		if (!res.getHeader('content-type')) {
			var charset = null;
			res.setHeader('Content-Type', type);
		}
		res.setHeader('Accept-Ranges', 'bytes');

		// transfer
		if (head)
			return res.end();

		// stream
		var stream = fs.createReadStream(path, opts);
		stream.pipe(res);

		// callback
		if (fn) {
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
function invalidRange(res) {
	var body = 'Requested Range Not Satisfiable';
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', body.length);
	res.statusCode = 416;
	res.end(body);
}