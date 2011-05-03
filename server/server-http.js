
var http = require('http');
var rpc = require('./rpc');
var auth = require('./auth');

var Http = function(port, host) {
	this.http = http.createServer( function(request, response) {
		//var urlPath = url.parse(request.url,true);
		if(request.url.indexOf("favicon") >= 1 ) {
			response.writeHead(200, {
				'Content-Type': 'image/x-icon'
			});
			response.end("");
			return;
		}

		if(request.method == 'POST' || request.method == 'OPTIONS') {

			request.setEncoding('utf8');
			console.log('run')
			var data = []
			request.on('data', function(chunk) {
				data.push(chunk)
				//console.log(JSON.parse(chunk))

			});
			request.on('end', function() {
				//try {
					data = JSON.parse(data.join(''))
					console.log(data)
					auth(data, {
						type:'http',
						connId:response
					}, function(a) {
						response.writeHead(200, {
							'Content-Type': 'application/json',
							'Connection': 'close'
						});
						response.end(JSON.stringify(a));
					})
				

				console.log('end');
			});
		} else {
			response.writeHead(200, {
				'Content-Type': 'application/json',
				'Connection': 'close'
			});
			response.end(JSON.stringify({
				name:null,
				device:null,
				id:null,
				key:null,
				result:null,
				error:'Sorry only POST.'
			}));
		}
	})
	this.http.listen(port, host)
}


module.exports = Http