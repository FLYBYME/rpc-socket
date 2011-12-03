/*!
* partition.io
* Copyright(c) 2011 Russell Bradberry <rbradberry@gmail.com>
* MIT Licensed
*/

/**
 * Module dependencies
 */
var util = require('util');
var utils = require('./utils');
var net = require('net');
var Peer = require('./peer');
var rpc = require('./rpc');

/**
 * Servent constructor
 *
 * @constructor
 */
var Servent = function() {
	var self = this;

	/**
	 * Listens for new connections and adds a peer for each one
	 */
	function onConnection(socket) {
		console.info('Peer connection request received');
		this.addPeer(socket);
	}

	/**
	 * Print some info once we are listening
	 */
	function onListen() {
		console.info('Servent listening on: ' + JSON.stringify(self.address()));
	}


	this.peers = {};
	this.isMaster = false;
	this.isWorker = false;
	this.id = utils.keyGen();
	this.on('connection', onConnection.bind(this));
	this.on('listening', onListen.bind(this));
};
/**
 * Inherits from net.Server
 */
util.inherits(Servent, net.Server);

/**
 * Adds an instance of a peer to out peers cache
 *
 * @param {Socket} socket The socket connection of the peer
 */
Servent.prototype.addPeer = function(socket) {
	var self = this, peer = new Peer(null, socket, this);

	socket.setNoDelay();
	peer.discover();

	/**
	 * Once the discovery is finished, we can add it to the peers
	 */
	function onDiscovered() {
		console.info('Peer with id:' + peer.id + ' discovered');
		this.peers[peer.id] = peer;
		this.sendPeerInfo(peer);
	}

	/**
	 * If the socket suddenyl ends, then remove it immediately
	 */
	function onEnd() {
		console.info('Removing peer with id:' + peer.id + ' due to disconnect');
		delete this.peers[peer.id];
		this.emit('peer disconnect', peer)
	}


	peer.on('end', onEnd.bind(this));
	peer.once('discovered', onDiscovered.bind(this));
};
/**
 * Removes a peer from the cache
 *
 * @param {String} id The unique peer id
 */
Servent.prototype.removePeer = function(id) {
	console.info('Removing peer with id:' + id);
	this.peers[id].destroy();
	delete this.peers[id];
};
/**
 * Removes a peer from the cache
 *
 * @param {String} id The unique peer id
 */
Servent.prototype.setMaster = function(is) {

	this.isMaster = !!is;
};
/**
 * Removes a peer from the cache
 *
 * @param {String} id The unique peer id
 */
Servent.prototype.hasPeer = function(id, port, host) {

	if(!this.peers[id]) {

	}
};
/**
 * Sends current servent peers information about the new peer
 *
 * @param {Peer} current The peer to send the information to
 */
Servent.prototype.sendPeerInfo = function(current) {
	var i = 0, peer, peerKeys = Object.keys(this.peers), peerLength = peerKeys.length;

	for(; i < peerLength; i += 1) {
		peer = this.peers[peerKeys[i]];
		if(peer.id === this.id || peer.id === current.id) {
			continue;
		}

		console.info('Sending peer information about peer: ' + current.id + ' to: ' + peer.id);
		peer.send({
			type : 'newPeer',
			id : current.id,
			port : current.port,
			host : current.host
		});
	}

	this.emit('peer', current)
};
/**
 * Connects to a peer with the given address or path
 *
 * @param {Number} port The ports of the host to connect to
 * @param {String} host The hostname to connect to
 */
Servent.prototype.connect = function(port, host) {

	var socket;
	var peers = this.peers;
	var peerKeys = Object.keys(peers);
	var peer;

	console.info('Connecting to new peer on port:' + port + ' with host:' + host);

	for(var i = peerKeys.length - 1; i >= 0; i--) {
		peer = peers[peerKeys[i]];
		if(peer.host === host && peer.port === port) {
			console.warn('Already connected to peer on port:' + port + ' with host:' + host + '. Ignoring.');
			return;
		}
	};

	var socket = net.connect(port, host);
	/**
	 * When we connect, register the socket as a peer
	 */
	function onConnect() {
		console.info('Peer connected on port:' + port + ' with host:' + host);
		this.addPeer(socket);
	}


	socket.on('connect', onConnect.bind(this));
};
/**
 * Destroys connection with all peers
 */
Servent.prototype.destroy = function() {
	var keys = Object.keys(this.peers), len = keys.length, i = 0;

	//remove all the peers
	console.info('Removing ' + len + ' peers');
	for(; i < len; i += 1) {
		this.removePeer(keys[i]);
	}

	//stop listening
	this.close();
};
/**
 * Broadcasts a message to all peers registered with the server
 *
 * @param {String} evt The event to broadcast
 *
 * @return {Number} The number of peers the request was sent to
 */
Servent.prototype.broadcast = function(evt) {
	var keys = Object.keys(this.peers), len = keys.length, peer, i = 0;

	console.info('Broadcasting event ' + evt + ' to ' + len + ' peers');
	for(; i < len; i += 1) {
		peer = this.peers[keys[i]];
		peer.emit.apply(peer, arguments);
	}

	return len;
};
Servent.prototype.broadcastRpc = function(method, params, callBack) {

	var keys = Object.keys(this.peers), len = keys.length, peer, i = 0;

	console.info('Broadcasting rpc event ' + method + ' to ' + params.join(', ') + ' peers');
	for(; i < len; i += 1) {
		peer = this.peers[keys[i]];
		peer.rpc.makeCall(method, params, callBack);
	}

	return len;
};
/**
 * Creates a worker object for this servent
 */
Servent.prototype.expose = function(mod, object) {
	rpc.exposeGlobal(mod, object)
};

module.exports = Servent;
