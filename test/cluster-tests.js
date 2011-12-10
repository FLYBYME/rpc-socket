var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var p = require('../lib/protocols/process')

var numReqs = 0;

if(cluster.isMaster) {
	// Fork workers.
	for(var i = 0; i < numCPUs; i++) {

		(new p(cluster.fork())).expose('numReqs', function(a) {

			this.send('numReqs', numReqs++);
		});
	}

	setInterval(function() {
		console.log("numReqs =", numReqs);
	}, 1000);
} else {

	var rpc = new p(process);
	// Worker processes have a http server.
	http.Server(function(req, res) {
		res.writeHead(200);
		// Send message to master process
		rpc.invoke('numReqs', [], function(err, result) {
			//console.log('Error: ', err)
			//console.log('Result: ', result);

			res.end("hello world!\nOh and numReqs: " + result.numReqs + "\n");
		})
	}).listen(8000);
}