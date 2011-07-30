

module.exports = function(rpc, manager) {

	rpc.expose('system', {
		init : function() {
			console.log('system.init')
			console.log(this.socketId)
			this.pushResult(true);
			this.send();
		}
	})
}