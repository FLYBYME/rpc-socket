var net = require('net');
var rpc = require('./rpc');
var auth = require('./auth');

var clientTcp = function(port, host) {

	var self = this;

	this.socket = net.Stream()
	this.socket.setEncoding('utf8')

	this.socket.on('connect', function() {
		console.log('connect')
		self.socket.write(JSON.stringify({
			name:'bob',
			device:'remote',
			id:'sadasd',
			test:'',
			logIn:''
		}))
	})
	this.socket.on('data', function(data) {
		data = JSON.parse(data)
		console.log(data)
		auth(data, {
			type:'tcp-socket',
			conId:0
		}, function(a) {
			self.socket.write(JSON.stringify(a))
		})
	})
	this.socket.on('end', function() {

		console.log('end')
	})
	this.socket.connect(port, host);
	return this;
};
module.exports = clientTcp