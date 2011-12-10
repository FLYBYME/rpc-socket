var Dep = require('../lib/dep')
console.log(Dep)

var dep = new Dep()

console.log(dep)

console.log(dep.loadCode( function(a) {

	console.log('a ', a)
	console.log('block')
	console.log(this)

}.toString(), [{
	val : 'dsfsdf',
	key : 'a'
}], dep, function() {
	console.log('callBack')
}).run())