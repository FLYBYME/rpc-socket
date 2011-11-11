var port = 8888
var Servent = require('../lib/servent')
var servent = new Servent();

servent.on('listening', function() {
	/**
	 * If we arent on our default port then we weren't
	 * the first node, so connect to that one
	 */
	if(servent.address().port !== port) {
		servent.connect(port);

	}
});
/**
 * First bind to our default port, if we can't then use
 * an ephemeral port instead
 */
servent.on('error', function(err) {
	if(err.code === 'EADDRINUSE') {
		servent.listen(0);
	}
});
servent.on('rpc', function(rpc) {

	var count = 0
	for(var i = 50; i >= 0; i--) {
		servent.broadcastRpc('list', [], function(err, result) {
			console.log('list return count: ' + count++)
		})
	};

});
servent.listen(port);
