RPC-Socket
=============

This is a project that I have been working on for a bit. it's still under heavy development but is coming along.

TODO
-------

So a few things i still want to add.

* Nothing as we speak, I'm still thinking.


Install
------------

A few ways of installing.


### NPM

Yeah so to install is real easy.

    npm install rpc-socket

or to access the rpc-socket executable install globally:

    npm install -g rpc-socket


### GIT

You might want to download and move to a folder of your choise and test it out.


    cd /path/to/your/folder
    git clone git://github.com/FLYBYME/rpc-socket.git
    cd rpc-socket


### Basic usage.


```javascript

	var cp = require('child_process');
	var p = require('../lib/protocols/process')
	var numCPUs = require('os').cpus().length;
	
	if(process.send) {
	
		(new p(process)).invoke('test', [3454545], function(err, result) {
			//console.log('Error: ', err)
			//console.log('Result: ', result)
	
		});
	} else {
		var j = 0;
		var callBack = function(err, result) {
			console.log('Error: ', err)
			console.log('Result: ', result);
			if(++j === numCPUs) {
				process.exit(0);
			}
		}
		for(var i = 0; i < numCPUs; i++) {
			(new p(cp.fork(__filename))).expose('test', function(a) {
				this.send('a', a);
			}).invoke('list', [], callBack);
		}
	}
```
