var sys = require('sys');
var fs = require('fs');
var util = require('util');
var http = require('http');
var file = __dirname + '\\VfE_html5.mp4'

require('http').createServer(function(req, res) {
	sys.puts(util.inspect(req.headers, showHidden = false, depth = 0));

	var stat = fs.statSync(file);
	if (!stat.isFile())
		return;

	var start = 0;
	var end = 0;
	var range = req.headers.Range || req.headers.range;
	if (range != null) {
		start = parseInt(range.slice(range.indexOf('bytes=') + 6, range.indexOf('-')));
		end = parseInt(range.slice(range.indexOf('-') + 1, range.length));
	}
	console.log(end)
	if (Number(end) === 'NaN' || isNaN(end) || end == 0)
		end = stat.size - 1;

	if (start > end)
		return;

	sys.puts('Browser requested bytes from ' + start + ' to ' + end + ' of file ' + file);

	var date = new Date();

	res.writeHead(206, { // NOTE: a partial http response
		'Date' : date.toUTCString(),
		// 'Connection' : 'close',
		// 'Cache-Control' : 'private',
		'Content-Type' : 'video/mp4',
		'Content-Length' : end - start,
		'Content-Range' : 'bytes ' + start + '-' + end + '/' + stat.size,
		'Accept-Ranges' : 'bytes',
		'Server' : 'CustomStreamer/0.0.1',
		'Transfer-Encoding' : 'chunked'
	});
	var stream = fs.createReadStream(file, {
		flags : 'r',
		start : start,
		// encoding : 'binary',
		fd : null,
		end : end,
		bufferSize : 64 * 1024
	});
	stream.on('drain', function() {
		console.log('stream drain')
	})
	stream.on('data', function() {
		console.log('stream data')
	})
	res.on('drain', function() {
		console.log('res drain')
	})
	stream.pipe(res, {
		// encoding : 'binary',
		end : true
	});
}).listen(9099, "127.0.0.1");
process.on('uncaughtException', function(err) {
	sys.puts(err);
});