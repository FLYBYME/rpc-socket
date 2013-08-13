var Server = require('./').Server

var server = new Server({
	port : 8000,
	auth : function(user, pass, next) {
		console.log('user auth: ', user)
		if (user == 'test' && pass == 'test') {
			next(null, {
				user : user,
				userinfo : true
			})
		} else {
			next()
		}
	}
})

server.rpc.expose('server', {
	test : function() {
		this.send({
			hello : 'world'
		})
	}
})
