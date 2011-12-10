/*
 *
 *
 */
module.exports.Stack = require('./lib/stack');
/*
 *
 *
 */
module.exports.RpcModule = require('./lib/rpc').RpcModule;
/*
 *
 *
 */
module.exports.protocols = {
	Io : require('./lib/protocols/socket.io'),
	Process : require('./lib/protocols/process'),
	Socket : require('./lib/protocols/socket')
};
/*
 *
 *
 */
module.exports.version = '0.0.6';
