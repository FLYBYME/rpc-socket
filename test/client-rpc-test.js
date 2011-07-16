var manager = require('../lib/manager');
var a = (new manager)
a.Client(9999, 'localhost', function(socket) {
	console.log('client start')
	a.callRpc('list', [], socket, function(y) {
		for ( var l = y.result.length - 1; l >= 0; l--) {
			a.callRpc(y.result[l], [], socket, function(y) {
				console.log(y.result)

			});
		}

	});
})
// console.log(a)
