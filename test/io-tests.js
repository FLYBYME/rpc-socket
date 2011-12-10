var i = require('socket.io');

var Io = require('../lib/protocols/socket.io');

var express = require('express');
var app = require('express').createServer();
var io = i.listen(app);
console.log('io  ', io)
app.listen(8000);
var generateData = function(n, floor) {
	var data = [], p = (Math.random() * 11) + 1, i;
	floor = (!floor && floor !== 0) ? 20 : floor;

	for( i = 1; i < (n || 12); i++) {
		data.push({
			name : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i % 12],
			2008 : Math.floor(Math.max((Math.random() * 100), floor)),
			2009 : Math.floor(Math.max((Math.random() * 100), floor)),
			2010 : Math.floor(Math.max((Math.random() * 100), floor)),
			data4 : Math.floor(Math.max((Math.random() * 100), floor)),
			data5 : Math.floor(Math.max((Math.random() * 100), floor)),
			data6 : Math.floor(Math.max((Math.random() * 100), floor)),
			data7 : Math.floor(Math.max((Math.random() * 100), floor)),
			data8 : Math.floor(Math.max((Math.random() * 100), floor)),
			data9 : Math.floor(Math.max((Math.random() * 100), floor))
		});
	}
	return data;
}
var numCount = 0;
var histsData = [];
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n) {
	return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

function timestamp() {
	var d = new Date();
	return [d.getDate(), months[d.getMonth()], [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()), (d.getTime() + "").substr(-4, 4)].join(':')].join(' ');
};

setInterval(function() {

	if(histsData.length >= 50) {
		histsData.shift()
	}
	histsData.push({
		name : timestamp(),
		hits : numCount
	})

}, 5000)
var sockets = {}

io.sockets.on('connection', function(socket) {

	var c = 0;
	var n = 'No Nick!!'
	var _socket = (new Io(socket)).expose('message', function(message) {

		console.log(message)
		this.send('count', ++c)

		Object.keys(sockets).forEach(function(k) {
			sockets[k].invoke('message', ['<strong>' + n + '</strong> : ' + message], function() {

			})
		})
	}).expose('register', function(nick) {
		n = nick
		console.log(nick)
		this.send('count', ++c)
		Object.keys(sockets).forEach(function(k) {
			sockets[k].invoke('message', ['<strong>SYSTEM</strong> : Welcome new user: <strong>' + nick + '</strong>'], function() {

			})
		})
	});
	socket.on('disconnect', function() {
		delete sockets[_socket.is];
	})
	sockets[_socket.id] = _socket
});

app.configure(function() {
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	//app.use(express.static(__dirname + '/public'));
	app.use(express.cookieParser());

});
app.use(express.static(__dirname));

app.get('/', function(req, res) {
	res.send()
})

app.get('/rpc.js', function(req, res) {
	res.download('./rpc.js');
})
app.get('/client-io-test.js', function(req, res) {
	res.download('./client-io-test.js');
})