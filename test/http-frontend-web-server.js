var Manager = require('../lib/manager');
var fs = require('fs');
var manager = new Manager

var server = manager.createServer({
	port:9999,
	host:'192.168.1.101',
	type:'front end server',
	root:'/home/bob/Sencha-demo',
	ws:true
}).connect()

manager.load()