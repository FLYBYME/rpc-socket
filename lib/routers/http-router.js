function Router() {
	this.routes = {};
	this.hosts = []
};
module.exports = Router
Router.prototype.addRoute = function(hosts, pattern, callback) {
	if (typeof (pattern) === 'function' && this.hosts.length >= 1) {
		callback = pattern;
		pattern = hosts;
		hosts = this.hosts;
	} else if (!Array.isArray(hosts)) {
		throw 'Host names must be in an array.'
	}

	var normalizedPath = normalizePath(pattern);

	for ( var j = hosts.length - 1; j >= 0; j--) {
		var routes;
		if (!(routes = this.routes[hosts[j]])) {
			routes = this.routes[hosts[j]] = [];
		}
		routes.push({
			path : normalizedPath.regexp,
			keys : normalizedPath.keys,
			callback : callback
		});
	}
};

Router.prototype.addHosts = function(hosts) {
	if (!Array.isArray(hosts)) {
		throw 'Host names must be in an array.';
	}
	var currentHosts = this.hosts;

	for ( var j = hosts.length - 1; j >= 0; j--) {
		var host = hosts[j];
		if (!(currentHosts.indexOf(host) >= 0)) {
			currentHosts.push(host);
		}

	}
};
Router.prototype.route = function(request, response) {

	var host = request.headers.host.split(':')[0];

	var routes = this.routes;
	// var host = request.headers.host.split(':')[0];
	if (routes = routes[host]) {

		var captures
		var params = []

		for ( var j = routes.length - 1; j >= 0; j--) {
			var route = routes[j]
			var keys = route["keys"];
			if (captures = route["path"].exec(request.url)) {
				for ( var i = captures.length - 1; i >= 0; i--) {
					key = keys[i - 1];

					if (key) {
						params[key] = captures[i];
					} else {
						params.push(captures[i]);
					}
				}

				route.callback(request, response, params);
				return;

			}
		}
		var message = 'Bad Request.'
		response.writeHead(404, {
			"Content-Type" : "text/plain",
			"Content-Length" : message.length
		});
		if (request.method !== "HEAD")
			response.write(message);
		response.end();
	}
};
var normalizePath = function(pattern) {
	var keys = [];
	if (typeof (pattern) === 'string') {

		var expr = new RegExp('^' + pattern.concat('/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(\?)?/g, function(_, slash, format, key, optional) {
			keys.push(key);
			slash = slash || '';
			return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + '([^/]+))' + (optional || '');
		}).replace(/([\/.-])/g, '\\$1').replace(/\*/g, '(.+)') + '$', 'i');
	} else {
		var expr = pattern
	}
	return {
		regexp : expr,
		keys : keys
	};
};