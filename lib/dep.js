/***
 * Node modules
 */
var events = require('events');
var util = require('util');
var fs = require('fs');
/***
 * Local modules
 */
var uuid = require('./utils').uuid;

var Dep = module.exports = function() {
	this.contexts = {};
};

Dep.prototype.loadCode = function(block, locals, self, callBack) {

	var argsKeys = [];
	var argsObjs = [];

	for(var i = 0; i < locals.length; i++) {
		argsKeys.push(locals[i].key);
		argsObjs.push(locals[i].val);
	};

	argsKeys.push('return (' + block + ').apply(this, [' + argsKeys.join(', ') + ']);');

	var compiled = Function.apply({}, argsKeys);

	var contexts = {
		block : block,
		compiled : compiled,
		locals : locals,
		self : self,
		id : uuid(),
		run : function() {
			compiled.apply(self, argsObjs);
			return contexts;
		}
	};
	this.contexts[contexts.id] = contexts;
	return contexts;

};




