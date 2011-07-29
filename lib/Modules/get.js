



module.exports = function(rpc, manager) {

	rpc.expose('get', {
		news : function() {

			this.pushResult({
				athuor : 'Tommy',
				date : new Date,
				title : 'Welcome all!',
				content : "DrPizza commented on pull request 1375 on joyent/node 31 minutes ag64-bit IEEE doubles can store up to 2^53 with integer granularity. 2^53 bytes is over 9000 TB (8 PiB). Over gigabit ethernet, that much data will take..."
			}).send();
		}
	})
}