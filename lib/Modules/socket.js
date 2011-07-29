module.exports = function(rpc, manager) {

	rpc.expose('socket', {
		getKeys : function() {

			this.pushResult(Object.keys(manager.getSockets()));
			this.send();
		},
		sendToSocket : function(id, data) {

			this.pushResult(manager.writeSocket(id, data));
			this.send();
		},
		getKeysss : function() {

			this.pushResult(Object.keys(manager.getSocket()));
			this.send();
		}
	})
}