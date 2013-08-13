var Server = require('./lib/server')

var server = new Server({
	port : 8000
})

server.rpc.expose('server', {
	test : function() {
		this.send({
			hello : 'world'
		})
	}
})
