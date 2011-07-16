module.exports = function(rpc) {

	rpc.expose('reply', {
		postMessage: function(username,message) {
			console.log(arguments)
			this.pushResult(true);
			this.send();
		}
	})

}