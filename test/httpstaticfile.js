var manager = require('../lib/manager')



var server = manager.createServer({
	port : 9999,
	host : '192.168.1.100',
	type : 'http',
	root : '/var/www',
	hasSocket : false
}).on('open',function(){
	//Do something with the sicket.
}).on('close',function(){
	//Do something with the sicket.
})
