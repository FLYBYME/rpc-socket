var manager = require('../../lib/manager');




module.exports = function(rpc) {
	rpc.expose('customMobule', {
		plus : function(a,b) {
			this.push(a+b).send();
		}
	})
}