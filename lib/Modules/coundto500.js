


module.exports = function(rpc) {
	rpc.expose('countto500', function() {
		for ( var l = 500; l >= 0; l--) {
			this.pushResult('count' + l);
		}
		this.send();
	})
}