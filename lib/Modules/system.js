

module.exports = function(rpc, globalEvents) {

	globalEvents.on('system', function() {

	})
	rpc.expose('system', {
		init : function() {
			console.log('system.init')
			console.log(this.socketId)
			this.push({
				register : true
			});
			this.send();
		}
	})
}