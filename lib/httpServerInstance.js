var util = require('util');
var fs = require('fs');
var events = require('events');
var path = require('path');
var http = require('http');
var url = require('url');
var parse = require('url').parse;
var Router = require('./routers/http-router');
var Request = function(request) {
	this.request = request;

	this.__defineGetter__('url', function() {
		return request.url;
	});

	this.__defineGetter__('method', function() {
		return request.method;
	});

	this.__defineGetter__('headers', function() {
		return request.headers;
	});

	var uri = parse(unescape(request.url));

	this.__defineGetter__('uri', function() {
		return uri;
	});
	this.__defineGetter__('connection', function() {
		return request.connection;
	});

}
var Response = function(response) {
	this.response = response;

}
Response.prototype.send = Response.prototype.end = function(data) {
	this.response.end(data)
}

var httpServerInstance = module.exports = function(port, host) {
	this.host = host;
	this.port = port;
	this.server = http.createServer();
	this.hasInit = false;
	this.routes2 = {};
	this.routes = [];
	this.Router = new Router;
	var self = this;
	this.attachListiner('request', function(request, response) {

		self.getRoute2(request, response)

	}).attachListiner('close', function() {

	}).hasInit = true;

	events.EventEmitter.call(this);
	return this;
}
// So will act like an event emitter
util.inherits(httpServerInstance, events.EventEmitter);

httpServerInstance.prototype.attachListiner = function(name, fn) {

	this.server.on(name, fn);

	return this;
}

httpServerInstance.prototype.getRoute2 = function(request, response) {
	return this.Router.route(request, response)

}
httpServerInstance.prototype.addIo = function(server) {
	server.listen(this.server)
}
httpServerInstance.prototype.getRoute = function(host, request, response) {
	console.log(host)
	console.log(this.routes2[host])
	var message;

	if (this.routes2[host]) {

		var routes = this.routes2[host];

		var uri = request.uri;
		path = uri.pathname;

		for ( var i = routes.length - 1; i >= 0; i--) {

			var route = routes[i];

			if (request.method === route.method) {

				var match = path.match(route.pattern);
				if (match && match[0].length > 0) {
					match.shift();
					match = match.map(function(part) {
						return part ? unescape(part) : part;
					});

					match.unshift(response);
					match.unshift(request);

					if (route.format !== undefined) {
						var body = "";
						request.setEncoding('utf8');
						request.on('data', function(chunk) {
							body += chunk;
						});
						request.on('end', function() {
							if (route.format === 'json') {
								try {
									body = JSON.parse(unescape(body));
								} catch (e) {
									body = null;
								}
							}
							match.push(body);
							route.handler.apply(null, match);
						});
						return;
					}
					route.handler.apply(null, match);
					return;
				}
			}
		}
		message = 'Not Found';
	}
	message = 'Bad Host Name';
	response.writeHead(404, {
		"Content-Type" : "text/plain",
		"Content-Length" : message.length
	});
	if (request.method !== "HEAD")
		response.write(message);
	response.end();

}

httpServerInstance.prototype.addRoute = function(host, method, pattern, handler, format) {
	if (typeof pattern === 'string') {
		pattern = new RegExp("^" + pattern + "$");
	}
	var route = {
		method : method,
		pattern : pattern,
		handler : handler
	};
	if (format !== undefined) {
		route.format = format;
	}
	if (this.routes[host] === undefined) {
		this.routes[host] = [];
	}
	this.routes[host].push(route);
}
httpServerInstance.prototype.get = function(hosts, pattern, callback) {
	this.Router.addRoute(hosts, pattern, callback)
	return this;
}
httpServerInstance.prototype.addHosts = function(hosts) {
	return this.Router.addHosts(hosts)
}

httpServerInstance.prototype.listen = function() {
	if (this.hasInit) {
		// set the server to listen
		this.server.listen(this.port, this.host, function() {

		});
	}
}
