var manager = require('../lib/manager');


//setup the front end server.
var server = manager.createServer({
	port : 9999,
	host : '192.168.1.100',
	type : 'http',
	request : function(req, res) {
		//do something..
	}
}).on('open',function(){
	//Do something with the sicket.
}).on('close',function(){
	//Do something with the sicket.
})