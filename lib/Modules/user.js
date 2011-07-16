var userCount = 0

var User = function(id,info) {
	this.index = userCount++
	this.info = info
	this.id = id
	this.loggedin = true;
	this.timeLoggedOut = 0;
	this.timeLoggedIn = new Date().getTime();
}
User.prototype.remove = function() {
	userCount--;
}
User.prototype.update = function(info) {
	this.info = info;
}
User.prototype.login = function() {
	this.loggedin = true;
	this.timeLoggedIn = new Date().getTime();
}
User.prototype.logout = function() {
	this.loggedin = false;
	this.timeLoggedOut = new Date().getTime();
}
var users = exports.users = {};

module.exports = function(rpc) {

	rpc.expose('user', {
		logIn: function(userName, userInfo) {
			if(users.hasOwnProperty(userName)) {
				users[userName].login()
			} else {
				users[userName] = new User(userName, userInfo)

			}
			this.pushResult(true);
			this.send();
		},
		logOut: function(userName) {
			if(users.hasOwnProperty(userName)) {
				users[userName].logout()
			} else {

				this.pushResult(false);

				this.send();
				return
			}
			this.pushResult(true);
			this.send();
		},
		query: function(userName) {
			if(users.hasOwnProperty(userName)) {

				this.pushResult(users[userName].info)
			} else {

				this.pushResult(false);

			}
			this.send();
		},
		setInfo: function(userName, info) {
			if(users.hasOwnProperty(userName)) {
				users[userName].info = info;
				this.pushResult(true)
			} else {

				this.pushResult(false);

			}
			this.send();
		},
		getInfo: function(userName) {
			if(users.hasOwnProperty(userName)) {

				this.pushResult(users[userName].info)
			} else {

				this.pushResult(false);

			}
			this.send();
		}
	})

}