var net = require('net');
var server = net.createServer( function (c) {
	c.write(JSON.stringify({
		name:'bob',
		device:'remote',
		id:'sadasd',
		test:'',
		logIn:''
	}));

	c.setEncoding('utf8')
	c.on('data', function(data) {
		data = JSON.parse(data)
		console.log(data)
	})
});
server.listen(8124, 'localhost');