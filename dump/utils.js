var ranKey = [];
var genKey = function() {
	for (var l = (100 - ranKey.length); l >= 0; l--) {
		var chars = "0123456789abcdefghijklmnopqrstuvwxyz";
		var len = chars.length
		var key = [];
		key.push('a')
		for (var i = 9; i >= 0; i--) {
			var rnum = Math.floor(Math.random() * len);
			key.push(chars.substring(rnum, rnum + 1));
		}
		key = key.join('');
		if (ranKey.indexOf(key) != -0) {
			ranKey.push(key)
		}

	}
}
genKey()

exports.keyGen = function() {
	if (ranKey.length <= 100) {
		genKey()
	}
	console.log(ranKey.length)
	return ranKey.shift()
};

exports.Mixin = function Mixin(target, source) {
  if (source) {
    for(var key, keys = Object.keys(source), l = keys.length; l--; ) {
      key = keys[l];
    
      if(source.hasOwnProperty(key)){
        target[key] = source[key];
      }
    }
  }
  return target;
};


