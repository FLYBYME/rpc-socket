var someAsyncFunc = function(data, callBack){
	callBack(data.join('|'))
}

module.exports = function(rpc) {

	rpc.expose('tcp.auth', function(name, pass) {
		var exposed = this;
		someAsyncFunc([name, pass],function(data){
			exposed.result(data).send()
		})
	}).expose('http', {
		// NOTE Can do large objects with rpc.expose
		auth : function() {
			var exposed = this;
			exposed.result([]).send()
		},
		logOut : function() {
			var exposed = this;
			//NOTE if error is called result will be null.
			exposed.result([]).error('Some great error string.').send()
		}
	})
}