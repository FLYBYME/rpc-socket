var http = require('http');
var fs = require('fs');
var util = require('util');

http.createServer(function(req, res) {
	res.writeHead(200, {
		'Content-Type' : 'text/plain'
	});
	var stream = fs.createReadStream('/var/www/downs/hard.time.s03e05.hdtv.xvid-momentum.avi', {});
	var startTime = Date.now();
	var bit = 0;
	var tog= true;
	var q = setInterval(function() {
		if(tog){
			stream.pause()
			tog = true;
		}else{
			stream.resume()
			tog = false;
		}
	}, 5500)
	
	var d = setInterval(function() {
		startTime = Date.now();
		bit = 0;
	}, 5000)
	stream.pipe(res)
	stream.on('data', function(cunk) {
		bit += cunk.length
		util.print(((bit * 1024) / ((Date.now() - startTime) * 1000)).toFixed(2) + 'KB/s\n');
	}).on('end', function() {
		clearInterval(d)
		clearInterval(q)
	});

}).listen(1337, "208.53.183.73");
console.log('Server running at http://127.0.0.1:1337/');