var server = manager.createServer({
	port : 9999,
	host : '192.168.1.100',
	type : 'http',
	root : '/var/www',
	hasSocket : false
})