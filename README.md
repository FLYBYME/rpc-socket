RPC-Socket
=============

This is a project that I have been working on for a bit.

Install
------------

### NPM

Yeah so to install is real easy.

    npm install rpc-socket

### Basic usage.

## Uses the server.

```javascript
var Server = require('./lib/server')

var server = new Server({
	port : 8000
})

server.rpc.expose('server', {
	test : function() {
		this.send({
			hello : 'world'
		})
	}
})

```

## Uses the server.

```html
<script src="engine.io.js"></script>
<script src="rpc-socket.js"></script>
<script>

	var rpc = new RpcModule()
	rpc.connect('ws://localhost:8000')
	rpc.invoke('server.test', [], console.log.bind(console))
</script>
```
