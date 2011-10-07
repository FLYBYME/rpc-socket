var Test = function() {

}

Test.prototype.foo = function(a, b) {
	return a + b;
}
Test.prototype.bar = function(a, b, callBack) {
	callBack(a + b);
}
var test = new Test()

module.exports = function(rpc) {
	var ticker = 0;
	rpc.expose('test', {
		foo : function(a, b) {
			this.set('foo', test.foo(a, b));
			this.send();
		},
		bar : function(a, b) {
			var exposed = this;
			test.bar(a, b, function(err, result) {
				exposed.send('bar', result);
			})
		},
		deepCallBack : function(depth) {
			var exposed = this;

			exposed.set('deepCallBack', true);
			exposed.send('tikker', ticker++);

		}
	})
}