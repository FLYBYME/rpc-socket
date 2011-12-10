var cp = require('child_process');
var Stack = require('../lib/stack');
var stack = new Stack

var s = {
	create : function(rpc) {
		console.log('create')
	},
	distroy : function(rpc) {
		console.log('distroy')
	},
	locals : {
		privateModule : function(cb) {
			console.log('privateModule')
			this.sub.func(cb)
		},
		sub : {
			func : function(cb) {
				console.log(this)
				cb()
			}
		}
	},
	modules : {
		publicModule : function() {
			console.log(this)
			console.log('publicModule')
			var exposed = this;
			this.privateModule(function() {
				exposed.send()
			})
		}
	},
	name : 'ui'
}
stack.stackExpose(s)

stack.invoke('list', [], function() {
	console.log(arguments)
	console.log(stack)
	stack.invoke('ui.publicModule', [], function() {
		console.log(arguments)
		stack.sendCode(function(rpc) {
			rpc.stackExpose({
				create : function(rpc) {
					console.log('create')
				},
				distroy : function(rpc) {
					console.log('distroy')
				},
				locals : {
					privateModule : function(cb) {
						console.log('privateModule')
						this.sub.func(cb)
					},
					sub : {
						func : function(cb) {
							console.log(this)
							cb()
						}
					}
				},
				modules : {
					publicModule : function() {
						console.log(this)
						console.log('publicModule')
						var exposed = this;
						this.privateModule(function() {
							exposed.send()
						})
					}
				},
				name : 'remoteExposedStack'
			}, function() {
				console.log(arguments)
			})
		}, function() {
			console.log(arguments)
			stack.invoke('remoteExposedStack.publicModule', [], function() {
				console.log(arguments)
			})
		})
	})
})