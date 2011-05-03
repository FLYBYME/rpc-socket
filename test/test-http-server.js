var http = require('http');
var fs = require('fs');

var events = require('events');
var util = require('util');

var Http = http.createServer( function(request, response) {
	//var urlPath = url.parse(request.url,true);
	if(request.url.indexOf("favicon") >= 1 ) {
		response.writeHead(200, {
			'Content-Type': 'image/x-icon'
		});
		response.end("");
		return;
	}
	var count = 0;
	if(request.method == 'POST' || request.method == 'OPTIONS') {
		var boun = request.headers['content-type'].split('multipart/form-data; boundary=')[1];
		console.log(request.headers['content-type'].split('multipart/form-data; boundary=')[1])
		console.log(request.url.split('.')[1])
		var last = ''
		var stream = fs.createWriteStream(__dirname + request.url, {
			flags: 'w',
			mode: 0666
		});

		request.on('data', function(chunk) {

			if(count == 0) {

				last = chunk.split('image/jpeg')[0]

				if (stream.writable) {
					if (false === stream.write(chunk.split('image/jpeg')[1]))
						request.pause();
				}
			} else {
				if(chunk.split(boun).length >=2) {
					if (stream.writable) {
						if (false === stream.write(chunk.split(boun)[0]))
							request.pause();
					}
				} else {
					if (stream.writable) {
						if (false === stream.write(chunk))
							request.pause();
					}
				}

			}
			count++

		})
		stream.on('drain', function() {
			if (request.readable)
				request.resume();
		})
		request.on('end', function() {
			console.log('end')
		})
	} else {
		response.writeHead(200, {
			'Content-Type': 'text/html',
			'Connection': 'close'
		});

		fs.readFile('./test.html', function (err, data) {
			if (err) throw err;
			response.end(data);
		});
	}
})
Http.listen(8000)