var port = 8888
var Servent = require('../lib/servent')
var servent = new Servent();

servent.on('listening', function() {
	/**
	 * If we arent on our default port then we weren't
	 * the first node, so connect to that one
	 */
	if(servent.address().port !== port) {
		servent.connect(port, '208.53.183.73');

	}
});
/**
 * First bind to our default port, if we can't then use
 * an ephemeral port instead
 */
servent.on('error', function(err) {
	if(err.code === 'EADDRINUSE') {
		servent.listen(0, '208.53.183.73');
	}
});
servent.on('rpc', function(rpc) {

	rpc.expose('private', function() {

	})
});
servent.on('peer', function(peer) {
	peer.rpc.makeCall('list', [], function(err, result) {
		//console.log(arguments)
	})
});
servent.expose('test', function() {

})
servent.listen(port, '208.53.183.73');
