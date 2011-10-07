var rpc = require('../lib/rpc')
var keyGen = require('../lib/utils').keyGen
var net = require('net')

console.log(rpc)
var server = net.createServer()

//

server.on('connection', function(socket) {
	socket.setEncoding('utf8')

	var a = new rpc(socket);
	a.expose('test', {
		callBack : function(method, id) {
			var exposed = this;
			a.makeCall(method, [id], function(err, result) {
				exposed.set('err', err)
				exposed.set('result', result)
				exposed.send()
			})
		},
		callBack2 : function(id) {
			var exposed = this;
			exposed.set('id', id)
			exposed.send()
		}
	})

})

server.listen(8000);

setTimeout(function() {

	var socket = net.Stream();
	socket.setEncoding('utf8');
	var a = new rpc(socket);
	a.expose('test', {
		callBack : function(method, id) {
			var exposed = this;
			a.makeCall(method, [id], function(err, result) {
				exposed.set('err', err)
				exposed.set('result', result)
				exposed.send()
			})
		},
		callBack2 : function(id) {
			var exposed = this;
			exposed.set('id', id)
			exposed.send()
		}
	})
	setTimeout(function() {

		a.makeCall('list', [], function(err, result) {
			console.log('err')
			console.log(err)
			console.log('result')
			console.log(result)
			var id = keyGen()
			a.makeCall('test.callBack', ['test.callBack2', id], function(err, result) {
				console.log(result)
			})
		})
	}, 4000)
	socket.connect(8000);

}, 5000)