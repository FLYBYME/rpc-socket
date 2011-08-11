var manager = require('../lib/manager');

var clients = [];
// manager.load()//load the rpc modules.
console.log(manager)
var cleint = manager.createClient({
	port : 9999,
	host : '208.53.183.73',
	type : 'tcp'
})
var e = 0;
manager.on('socket', function(socket) {
	
})

for ( var i = 900; i >= 0; i--) {
	manager.createClient({
		port : 9999,
		host : '208.53.183.73',
		type : 'tcp'
	})
}
setInterval(function() {
	console.log('   - setInterval')
	manager.broadCastRpc('list', [], function() {
		console.log('   - RPC callback true')
	})
}, 3000)