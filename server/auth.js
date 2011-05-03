var emitter = new (require("events")).EventEmitter;
var keyGen = require('./keyGen')

var rpc = require('./rpc');
var user = {

};
var newUser = function(name) {
	return user[name] = {
		device: {
			player: {
				type:null,
				connId:null,
				data:[]
			},
			remote: {
				type:null,
				connId:null,
				data:[]
			},
			backup: {
				type:null,
				connId:null,
				data:[]
			}
		},
		key:keyGen(),
		name:name
	};
};
var runMessage = function(message, info, callBack) {
	var result = {};
	if(message.hasOwnProperty('id') && message.id !== '' && message.hasOwnProperty('name') && message.name !== '' && message.hasOwnProperty('device') && message.device !== '') {
		var u = user[message.name];

		if(message.hasOwnProperty('logIn')) {
			if(user.hasOwnProperty(message.name)) {
				u.device[message.device] = {
					type:info.type,
					connId:info.connId,
					data:[]
				};
			} else {
				newUser(message.name)
				user[message.name].device[message.device] = {
					type:info.type,
					connId:info.connId,
					data:[]
				};
			}
			//info.type == 'socket' ?
			return callBack({
				name:message.name,
				device:message.device,
				id:message.id,
				key:user[message.name].key,
				result:null,
				error:null
			})

		} else if(message.hasOwnProperty('key') && user.hasOwnProperty(message.name)) {
			var u = user[message.name];
			if(message.key === u.key) {
				if(message.hasOwnProperty('method') && message.hasOwnProperty('params')) {
					info.user = user[message.name];
					rpc.fireEvent(message.method,message.params,info, function(a) {
						return callBack({
							name:message.name,
							device:message.device,
							id:message.id,
							key:message.key,
							result:a.result,
							error:a.error
						})
					})
				} else {
					return callBack({
						name:null,
						device:null,
						id:null,
						key:null,
						result:null,
						error:'Not RPC call sorry.'
					})
				}

			} else {
				return callBack({
					name:null,
					device:null,
					id:null,
					key:null,
					result:null,
					error:'Your key is wrong. Please login..'
				})
			}

		} else {
			return callBack({
				name:null,
				device:null,
				id:null,
				key:null,
				result:null,
				error:'Missing one of (key, name, device). Please login..'
			})
		}

	} else {
		return callBack({
			name:null,
			device:null,
			id:null,
			key:null,
			result:null,
			error:'Missing maybe one of name, id, device.'
		})
	}

}
module.exports = runMessage