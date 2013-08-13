var util = require('util');
/**
 *
 *
 */

var Exposed = module.exports = function(data, id, user, cb) {
	var hasSent = false;
	var result = {};
	var error = {};
	var self = this
	//
	this.request = {}
	this.user = user
	this.request.id = data.id;
	this.request.method = data.method;
	this.request.params = data.params;

	function set(key, val) {
		result[key] = val;
	};
	function send(data, code) {
		if (hasSent) {
			throw new Error('should not sent twice.');
		}

		
			result = data
		

		var request = {
			//
			id : self.request.id
		}
		if (code) {
			request.code = code
		} else {
			request.code = 200
		}
		if (error['code']) {
			request.error = error
		} else {
			request.result = result

		}
		console.log(request)
		hasSent = true;
		cb(request);
		return self;
	}

	function errorFn(err, code) {

		if (err.stack) {

			error = {
				message : err.message,
				stack : err.stack,
				code : code || 1000,
				method : data.method,
				params : data.params
			};
		} else {

			error = {
				message : err,
				code : code || 1000,
				stack : '',
				method : data.method,
				params : data.params
			};
		}

		return send();
	};
	this.__defineGetter__("error", function() {
		return errorFn
	});
	this.__defineGetter__("send", function() {
		return send;
	});
	this.__defineGetter__("set", function() {
		return set;
	});
	this.__defineGetter__("callback", function() {
		return function(err, result) {
			if (err) {
				self.error(err)
			} else {
				self.send(result)
			}
		};
	});
};
