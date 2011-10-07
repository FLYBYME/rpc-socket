module.exports = function(rpc) {
	var counter = 0;
	rpc.expose('test2', {
		count : function(a) {
			//console.log(this)
			var exposed = this

			exposed.push({
				error : 'failed login' + (++counter),
				a : a
			}).send()
		}
	})
}