var rpc = require('./lib/client');
var args = process.argv;

var name = args[args.indexOf('--name') + 1];
var port = args[args.indexOf('--port') + 1];
var host = args[args.indexOf('--host') + 1];
var type = args[args.indexOf('--type') + 1];
var help = args[args.indexOf('--help') + 1];

if(port == 'node') {
	throw Error('port is missing try --port 8000')
} else if(host == 'node') {
	throw Error('host is missing try --host 192.168.0.100')
} else if(type == 'node') {
	throw Error('host is missing try --type websocket OR tcpsocket')
}

var a = new rpc.Client(host, port, type)