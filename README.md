JSON-RPC-Socket over many types of socket (TCP, WebSocket, HTTP).
===

So the idea behind this project is to create an easy to use JSON-RPC client and server setup.

To build:

	NAN

To run the tests:

    NAN


Resources that are been used.
---
  - [nodejs.org](http://nodejs.org/)


## What a node might look like.

	var node = {
		name : 'bobsNode',
		conn : [ {
			ip : '192.168.0.123',
			port : 43555,
			type : 'websocket'
		}, {
			ip : '192.168.0.123',
			port : 34434,
			type : 'http'
		} ],
		clients : [ 'jim', 'frank' ],
		nodes : [ 'jame', 'joe' ]
	};

## ToDo List
 - connections.Client, is almost done.
 - connections.Server, Need to rewite the code for this method.
 - rpc, IM going to rewite this module to better fit heavy events.