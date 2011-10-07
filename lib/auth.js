var crypto = require('crypto');

var SaltLength = 9;

var Auth = function(key) {
	this._salt = salt
	this._active = {}
}

Auth.prototype.register = function() {

}
Auth.prototype.login = function(hash, password, callBack) {
	var ourHash = md5(password + this._salt)
	if(ourHash === hash) {
		callBack()
	}
}
function md5(string) {
	return crypto.createHash('md5').update(string).digest('hex');
}

module.exports = Auth;
;