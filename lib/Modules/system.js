var manager = require('../manager')

module.exports = function(rpc, globalEvents) {

	rpc.expose('system', {
		init : function() {
			console.log('system.init')
			console.log(this.socketId)
			this.push({
				register : true,
				id : this.socketId
			});
			this.send();
		}
	})
}