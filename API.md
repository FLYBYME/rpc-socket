API
------

This should give you an understanding of how to use rpc-socket.
To start off you would want to require the manager for rpc-socket
   var manager = require('../lib/manager');

New TCP Server
------

   var server = manager.createServer({
   	port : 9998,
   	host : '192.168.1.100',
   	type : 'tcp'
   })