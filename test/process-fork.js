var cp = require('child_process');
var p = require('../lib/protocols/process')
var numCPUs = require('os').cpus().length;

if(process.send) {

	(new p(process)).invoke('test', [3454545], function(err, result) {
		//console.log('Error: ', err)
		//console.log('Result: ', result)

	});
} else {
	var j = 0;
	var callBack = function(err, result) {
		console.log('Error: ', err)
		console.log('Result: ', result);
		if(++j === numCPUs) {
			process.exit(0);
		}
	}
	for(var i = 0; i < numCPUs; i++) {
		(new p(cp.fork(__filename))).expose('test', function(a) {
			this.send('a', a);
		}).invoke('list', [], callBack);
	}
}