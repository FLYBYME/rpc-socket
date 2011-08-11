var manager = require('../lib/manager');

// manager.load()//load the rpc modules.
console.log(manager)
var a = 0
manager.on('socket', function(socket) {

	console.log('socket count: ' + manager.socketCount + ' and vsize: ' + process.memoryUsage().vsize)

	manager.rpc.call('list', [], socket, function() {
		console.log('   - socket count: ' + manager.socketCount + ' and vsize: ' + process.memoryUsage().vsize)
		console.log('   - rpc call went well Count: ' + a++)
	})
})
// setup the front end server.
var server = manager.createServer({
	port : 9999,
	host : '208.53.183.73',
	type : 'tcp'
})
console.log(server)