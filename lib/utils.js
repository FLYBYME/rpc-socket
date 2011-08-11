/*
* ! Connect - utils Copyright(c) 2010 Sencha Inc. Copyright(c) 2011 TJ
* Holowaychuk MIT Licensed
*/

/**
 * Module dependencies.
 */

var crypto = require('crypto'), Path = require('path'), fs = require('fs');

/**
 * Flatten the given `arr`.
 *
 * @param {Array}
 *            arr
 * @return {Array}
 * @api private
 */

exports.flatten = function(arr, ret) {
	var ret = ret || [], len = arr.length;
	for(var i = 0; i < len; ++i) {
		if(Array.isArray(arr[i])) {
			exports.flatten(arr[i], ret);
		} else {
			ret.push(arr[i]);
		}
	}
	return ret;
};
/**
 * Return md5 hash of the given string and optional encoding, defaulting to hex.
 *
 * utils.md5('wahoo'); // => "e493298061761236c96b02ea6aa8a2ad"
 *
 * @param {String}
 *            str
 * @param {String}
 *            encoding
 * @return {String}
 * @api public
 */

exports.md5 = function(str, encoding) {
	return crypto.createHash('md5').update(str).digest(encoding || 'hex');
};
/**
 * Merge object b with object a.
 *
 * var a = { foo: 'bar' } , b = { bar: 'baz' };
 *
 * utils.merge(a, b); // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object}
 *            a
 * @param {Object}
 *            b
 * @return {Object}
 * @api public
 */

exports.merge = function(a, b) {
	if(a && b) {
		for(var key in b) {
			a[key] = b[key];
		}
	}
	return a;
};
/**
 * Escape the given string of `html`.
 *
 * @param {String}
 *            html
 * @return {String}
 * @api public
 */

exports.escape = function(html) {
	return String(html).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};
/**
 * Return a unique identifier with the given `len`.
 *
 * utils.uid(10); // => "FDaS435D2z"
 *
 * @param {Number}
 *            len
 * @return {String}
 * @api public
 */

exports.uid = function(len) {
	var buf = [], chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', charlen = chars.length;

	for(var i = 0; i < len; ++i) {
		buf.push(chars[getRandomInt(0, charlen - 1)]);
	}

	return buf.join('');
};
/**
 * Parse the given cookie string into an object.
 *
 * @param {String}
 *            str
 * @return {Object}
 * @api public
 */

exports.parseCookie = function(str) {
	var obj = {}, pairs = str.split(/[;,] */);
	for(var i = 0, len = pairs.length; i < len; ++i) {
		var pair = pairs[i], eqlIndex = pair.indexOf('='), key = pair.substr(0, eqlIndex).trim().toLowerCase(), val = pair.substr(++eqlIndex, pair.length).trim();

		// quoted values
		if('"' == val[0])
			val = val.slice(1, -1);

		// only assign once
		if(undefined == obj[key]) {
			val = val.replace(/\+/g, ' ');
			try {
				obj[key] = decodeURIComponent(val);
			} catch (err) {
				if( err instanceof URIError) {
					obj[key] = val;
				} else {
					throw err;
				}
			}
		}
	}
	return obj;
};
/**
 * Serialize the given object into a cookie string.
 *
 * utils.serializeCookie('name', 'tj', { httpOnly: true }) // => "name=tj;
 * httpOnly"
 *
 * @param {String}
 *            name
 * @param {String}
 *            val
 * @param {Object}
 *            obj
 * @return {String}
 * @api public
 */

exports.serializeCookie = function(name, val, obj) {
	var pairs = [name + '=' + encodeURIComponent(val)], obj = obj || {};

	if(obj.domain)
		pairs.push('domain=' + obj.domain);
	if(obj.path)
		pairs.push('path=' + obj.path);
	if(obj.expires)
		pairs.push('expires=' + obj.expires.toUTCString());
	if(obj.httpOnly)
		pairs.push('httpOnly');
	if(obj.secure)
		pairs.push('secure');

	return pairs.join('; ');
};
/**
 * Pause `data` and `end` events on the given `obj`. Middleware performing async
 * tasks _should_ utilize this utility (or similar), to re-emit data once the
 * async operation has completed, otherwise these events may be lost.
 *
 * var pause = utils.pause(req); fs.readFile(path, function(){ next();
 * pause.resume(); });
 *
 * @param {Object}
 *            obj
 * @return {Object}
 * @api public
 */

exports.pause = function(obj) {
	var onData, onEnd, events = [];

	// buffer data
	obj.on('data', onData = function(data, encoding) {
		events.push(['data', data, encoding]);
	});
	// buffer end
	obj.on('end', onEnd = function(data, encoding) {
		events.push(['end', data, encoding]);
	});
	return {
		end : function() {
			obj.removeListener('data', onData);
			obj.removeListener('end', onEnd);
		},
		resume : function() {
			this.end();
			for(var i = 0, len = events.length; i < len; ++i) {
				obj.emit.apply(obj, events[i]);
			}
		}
	};
};
/**
 * Check `req` and `res` to see if it has been modified.
 *
 * @param {IncomingMessage}
 *            req
 * @param {ServerResponse}
 *            res
 * @return {Boolean}
 * @api public
 */

exports.modified = function(req, res, headers) {
	var headers = headers || res._headers || {}, modifiedSince = req.headers['if-modified-since'], lastModified = headers['last-modified'], noneMatch = req.headers['if-none-match'], etag = headers['etag'];

	if(noneMatch)
		noneMatch = noneMatch.split(/ *, */);

	// check If-None-Match
	if(noneMatch && etag && ~noneMatch.indexOf(etag)) {
		return false;
	}

	// check If-Modified-Since
	if(modifiedSince && lastModified) {
		modifiedSince = new Date(modifiedSince);
		lastModified = new Date(lastModified);
		// Ignore invalid dates
		if(!isNaN(modifiedSince.getTime())) {
			if(lastModified <= modifiedSince)
				return false;
		}
	}

	return true;
};
/**
 * Strip `Content-*` headers from `res`.
 *
 * @param {ServerResponse}
 *            res
 * @api public
 */

exports.removeContentHeaders = function(res) {
	Object.keys(res._headers).forEach(function(field) {
		if(0 == field.indexOf('content')) {
			res.removeHeader(field);
		}
	});
};
/**
 * Check if `req` is a conditional GET request.
 *
 * @param {IncomingMessage}
 *            req
 * @return {Boolean}
 * @api public
 */

exports.conditionalGET = function(req) {
	return req.headers['if-modified-since'] || req.headers['if-none-match'];
};
/**
 * Respond with 403 "Forbidden".
 *
 * @param {ServerResponse}
 *            res
 * @api public
 */

exports.forbidden = function(res) {
	var body = 'Forbidden';
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', body.length);
	res.statusCode = 403;
	res.end(body);
};
/**
 * Respond with 401 "Unauthorized".
 *
 * @param {ServerResponse}
 *            res
 * @param {String}
 *            realm
 * @api public
 */

exports.unauthorized = function(res, realm) {
	res.statusCode = 401;
	res.setHeader('WWW-Authenticate', 'Basic realm="' + realm + '"');
	res.end('Unauthorized');
};
/**
 * Respond with 400 "Bad Request".
 *
 * @param {ServerResponse}
 *            res
 * @api public
 */

exports.badRequest = function(res) {
	res.statusCode = 400;
	res.end('Bad Request');
};
/**
 * Respond with 304 "Not Modified".
 *
 * @param {ServerResponse}
 *            res
 * @param {Object}
 *            headers
 * @api public
 */

exports.notModified = function(res) {
	exports.removeContentHeaders(res);
	res.statusCode = 304;
	res.end();
};
/**
 * Return an ETag in the form of `"<size>-<mtime>"` from the given `stat`.
 *
 * @param {Object}
 *            stat
 * @return {String}
 * @api public
 */

exports.etag = function(stat) {
	return '"' + stat.size + '-' + Number(stat.mtime) + '"';
};
/**
 * Parse "Range" header `str` relative to the given file `size`.
 *
 * @param {Number}
 *            size
 * @param {String}
 *            str
 * @return {Array}
 * @api public
 */

exports.parseRange = function(size, str) {
	var valid = true;
	var arr = str.substr(6).split(',').map(function(range) {
		var range = range.split('-'), start = parseInt(range[0], 10), end = parseInt(range[1], 10);

		// -500
		if(isNaN(start)) {
			start = size - end;
			end = size - 1;
			// 500-
		} else if(isNaN(end)) {
			end = size - 1;
		}

		// Invalid
		if(isNaN(start) || isNaN(end) || start > end)
			valid = false;

		return {
			start : start,
			end : end
		};
	});
	return valid ? arr : undefined;
};
/**
 * Convert array-like object to an `Array`.
 *
 * node-bench measured "16.5 times faster than Array.prototype.slice.call()"
 *
 * @param {Object}
 *            obj
 * @return {Array}
 * @api public
 */

var toArray = exports.toArray = function(obj) {
	var len = obj.length, arr = new Array(len);
	for(var i = 0; i < len; ++i) {
		arr[i] = obj[i];
	}
	return arr;
};
/**
 * Retrun a random int, used by `utils.uid()`
 *
 * @param {Number}
 *            min
 * @param {Number}
 *            max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
	return Math.floor(Math.random() * ( max - min + 1)) + min;
}

/*
 * ! FLYBYME
 */

var ranKey = [];
var genKey = function() {
	for(var l = (100 - ranKey.length); l >= 0; l--) {
		var chars = "0123456789abcdefghijklmnopqrstuvwxyz";
		var len = chars.length
		var key = [];
		key.push('a')
		for(var i = 9; i >= 0; i--) {
			var rnum = Math.floor(Math.random() * len);
			key.push(chars.substring(rnum, rnum + 1));
		}
		key = key.join('');
		if(ranKey.indexOf(key) != -0) {
			ranKey.push(key)
		}

	}
}
genKey()

var keyGen = exports.keyGen = function() {
	if(ranKey.length <= 100) {
		genKey()
	}
	//console.log(ranKey.length)
	return ranKey.shift()
};
exports.Mixin = function Mixin(target, source) {
	if(source) {
		for(var key, keys = Object.keys(source), l = keys.length; l--; ) {
			key = keys[l];

			if(source.hasOwnProperty(key)) {
				target[key] = source[key];
			}
		}
	}
	return target;
};
var path = require('path')
var testType = {
	".3dm" : "x-world/x-3dmf",
	".3dmf" : "x-world/x-3dmf",
	".iso" : "application/x-iso9660-image",
	".jpg" : "image/jpeg",
	".a" : "application/octet-stream",
	".aab" : "application/x-authorware-bin",
	".aam" : "application/x-authorware-map",
	".aas" : "application/x-authorware-seg",
	".abc" : "text/vnd.abc",
	".acgi" : "text/html",
	".afl" : "video/animaflex",
	".ai" : "application/postscript",
	".aif" : "audio/aiff",
	".aif" : "audio/x-aiff",
	".aifc" : "audio/aiff",
	".aifc" : "audio/x-aiff",
	".aiff" : "audio/aiff",
	".aiff" : "audio/x-aiff",
	'.manifest' : 'text/cache-manifest',
	".aim" : "application/x-aim",
	".aip" : "text/x-audiosoft-intra",
	".ani" : "application/x-navi-animation",
	".aos" : "application/x-nokia-9000-communicator-add-on-software",
	".aps" : "application/mime",
	".arc" : "application/octet-stream",
	".arj" : "application/arj",
	".arj" : "application/octet-stream",
	".art" : "image/x-jg",
	".asf" : "video/x-ms-asf",
	".asm" : "text/x-asm",
	".asp" : "text/asp",
	".asx" : "application/x-mplayer2",
	".asx" : "video/x-ms-asf",
	".asx" : "video/x-ms-asf-plugin",
	".au" : "audio/basic",
	".au" : "audio/x-au",
	".avi" : "application/x-troff-msvideo",
	".avi" : "video/avi",
	".avi" : "video/msvideo",
	".avi" : "video/x-msvideo",
	".avs" : "video/avs-video",
	".bcpio" : "application/x-bcpio",
	".bin" : "application/mac-binary",
	".bin" : "application/macbinary",
	".bin" : "application/octet-stream",
	".bin" : "application/x-binary",
	".bin" : "application/x-macbinary",
	".bm" : "image/bmp",
	".bmp" : "image/bmp",
	".bmp" : "image/x-windows-bmp",
	".boo" : "application/book",
	".book" : "application/book",
	".boz" : "application/x-bzip2",
	".bsh" : "application/x-bsh",
	".bz" : "application/x-bzip",
	".bz2" : "application/x-bzip2",
	".c" : "text/plain",
	".c" : "text/x-c",
	".c++" : "text/plain",
	".cat" : "application/vnd.ms-pki.seccat",
	".cc" : "text/plain",
	".cc" : "text/x-c",
	".ccad" : "application/clariscad",
	".cco" : "application/x-cocoa",
	".cdf" : "application/cdf",
	".cdf" : "application/x-cdf",
	".cdf" : "application/x-netcdf",
	".cer" : "application/pkix-cert",
	".cer" : "application/x-x509-ca-cert",
	".cha" : "application/x-chat",
	".chat" : "application/x-chat",
	".class" : "application/java",
	".class" : "application/java-byte-code",
	".class" : "application/x-java-class",
	".com" : "application/octet-stream",
	".com" : "text/plain",
	".conf" : "text/plain",
	".cpio" : "application/x-cpio",
	".cpp" : "text/x-c",
	".cpt" : "application/mac-compactpro",
	".cpt" : "application/x-compactpro",
	".cpt" : "application/x-cpt",
	".crl" : "application/pkcs-crl",
	".crl" : "application/pkix-crl",
	".crt" : "application/pkix-cert",
	".crt" : "application/x-x509-ca-cert",
	".crt" : "application/x-x509-user-cert",
	".csh" : "application/x-csh",
	".csh" : "text/x-script.csh",
	".css" : "application/x-pointplus",
	".css" : "text/css",
	".cxx" : "text/plain",
	".dcr" : "application/x-director",
	".deepv" : "application/x-deepv",
	".def" : "text/plain",
	".der" : "application/x-x509-ca-cert",
	".dif" : "video/x-dv",
	".dir" : "application/x-director",
	".dl" : "video/dl",
	".dl" : "video/x-dl",
	".doc" : "application/msword",
	".dot" : "application/msword",
	".dp" : "application/commonground",
	".drw" : "application/drafting",
	".dump" : "application/octet-stream",
	".dv" : "video/x-dv",
	".dvi" : "application/x-dvi",
	".dwf" : "drawing/x-dwf (old)",
	".dwf" : "model/vnd.dwf",
	".dwg" : "application/acad",
	".dwg" : "image/vnd.dwg",
	".dwg" : "image/x-dwg",
	".dxf" : "application/dxf",
	".dxf" : "image/vnd.dwg",
	".dxf" : "image/x-dwg",
	".dxr" : "application/x-director",
	".el" : "text/x-script.elisp",
	".elc" : "application/x-bytecode.elisp",
	".elc" : "application/x-elc",
	".env" : "application/x-envoy",
	".eps" : "application/postscript",
	".es" : "application/x-esrehber",
	".etx" : "text/x-setext",
	".evy" : "application/envoy",
	".evy" : "application/x-envoy",
	".exe" : "application/octet-stream",
	".f" : "text/plain",
	".f" : "text/x-fortran",
	".f77" : "text/x-fortran",
	".f90" : "text/plain",
	".f90" : "text/x-fortran",
	".fdf" : "application/vnd.fdf",
	".fif" : "application/fractals",
	".fif" : "image/fif",
	".fli" : "video/fli",
	".fli" : "video/x-fli",
	".flo" : "image/florian",
	".flx" : "text/vnd.fmi.flexstor",
	".fmf" : "video/x-atomic3d-feature",
	".for" : "text/plain",
	".for" : "text/x-fortran",
	".fpx" : "image/vnd.fpx",
	".fpx" : "image/vnd.net-fpx",
	".frl" : "application/freeloader",
	".funk" : "audio/make",
	".g" : "text/plain",
	".g3" : "image/g3fax",
	".gif" : "image/gif",
	".gl" : "video/gl",
	".gl" : "video/x-gl",
	".gsd" : "audio/x-gsm",
	".gsm" : "audio/x-gsm",
	".gsp" : "application/x-gsp",
	".gss" : "application/x-gss",
	".gtar" : "application/x-gtar",
	".gz" : "application/x-compressed",
	".gz" : "application/x-gzip",
	".gzip" : "application/x-gzip",
	".gzip" : "multipart/x-gzip",
	".h" : "text/plain",
	".h" : "text/x-h",
	".hdf" : "application/x-hdf",
	".help" : "application/x-helpfile",
	".hgl" : "application/vnd.hp-hpgl",
	".hh" : "text/plain",
	".hh" : "text/x-h",
	".hlb" : "text/x-script",
	".hlp" : "application/hlp",
	".hlp" : "application/x-helpfile",
	".hlp" : "application/x-winhelp",
	".hpg" : "application/vnd.hp-hpgl",
	".hpgl" : "application/vnd.hp-hpgl",
	".hqx" : "application/binhex",
	".hqx" : "application/binhex4",
	".hqx" : "application/mac-binhex",
	".hqx" : "application/mac-binhex40",
	".hqx" : "application/x-binhex40",
	".hqx" : "application/x-mac-binhex40",
	".hta" : "application/hta",
	".htc" : "text/x-component",
	".htm" : "text/html",
	".html" : "text/html",
	".htmls" : "text/html",
	".htt" : "text/webviewhtml",
	".htx " : "text/html",
	".ice " : "x-conference/x-cooltalk",
	".ico" : "image/x-icon",
	".idc" : "text/plain",
	".ief" : "image/ief",
	".iefs" : "image/ief",
	".iges" : "application/iges",
	".iges " : "model/iges",
	".igs" : "application/iges",
	".igs" : "model/iges",
	".ima" : "application/x-ima",
	".imap" : "application/x-httpd-imap",
	".inf " : "application/inf",
	".ins" : "application/x-internett-signup",
	".ip " : "application/x-ip2",
	".isu" : "video/x-isvideo",
	".it" : "audio/it",
	".iv" : "application/x-inventor",
	".ivr" : "i-world/i-vrml",
	".ivy" : "application/x-livescreen",
	".jam " : "audio/x-jam",
	".jav" : "text/plain",
	".jav" : "text/x-java-source",
	".java" : "text/plain",
	".java " : "text/x-java-source",
	".jcm " : "application/x-java-commerce",
	".jfif" : "image/jpeg",
	".jfif" : "image/pjpeg",
	".jfif-tbnl" : "image/jpeg",
	".jpe" : "image/jpeg",
	".jpe" : "image/pjpeg",
	".jpeg" : "image/jpeg",
	".jpeg" : "image/pjpeg",
	".jpg " : "image/jpeg",
	".jpg " : "image/pjpeg",
	".jps" : "image/x-jps",
	".js" : "application/x-javascript",
	".jut" : "image/jutvision",
	".kar" : "audio/midi",
	".kar" : "music/x-karaoke",
	".ksh" : "application/x-ksh",
	".ksh" : "text/x-script.ksh",
	".la" : "audio/nspaudio",
	".la" : "audio/x-nspaudio",
	".lam" : "audio/x-liveaudio",
	".latex " : "application/x-latex",
	".lha" : "application/lha",
	".lha" : "application/octet-stream",
	".lha" : "application/x-lha",
	".lhx" : "application/octet-stream",
	".list" : "text/plain",
	".lma" : "audio/nspaudio",
	".lma" : "audio/x-nspaudio",
	".log " : "text/plain",
	".lsp " : "application/x-lisp",
	".lsp " : "text/x-script.lisp",
	".lst " : "text/plain",
	".lsx" : "text/x-la-asf",
	".ltx" : "application/x-latex",
	".lzh" : "application/octet-stream",
	".lzh" : "application/x-lzh",
	".lzx" : "application/lzx",
	".lzx" : "application/octet-stream",
	".lzx" : "application/x-lzx",
	".m" : "text/plain",
	".m" : "text/x-m",
	".m1v" : "video/mpeg",
	".m2a" : "audio/mpeg",
	".m2v" : "video/mpeg",
	".m3u " : "audio/x-mpequrl",
	".man" : "application/x-troff-man",
	".map" : "application/x-navimap",
	".mar" : "text/plain",
	".mbd" : "application/mbedlet",
	".mc$" : "application/x-magic-cap-package-1.0",
	".mcd" : "application/mcad",
	".mcd" : "application/x-mathcad",
	".mcf" : "image/vasa",
	".mcf" : "text/mcf",
	".mcp" : "application/netmc",
	".me " : "application/x-troff-me",
	".mht" : "message/rfc822",
	".mhtml" : "message/rfc822",
	".mid" : "application/x-midi",
	".mid" : "audio/midi",
	".mid" : "audio/x-mid",
	".mid" : "audio/x-midi",
	".mid" : "music/crescendo",
	".mid" : "x-music/x-midi",
	".midi" : "application/x-midi",
	".midi" : "audio/midi",
	".midi" : "audio/x-mid",
	".midi" : "audio/x-midi",
	".midi" : "music/crescendo",
	".midi" : "x-music/x-midi",
	".mif" : "application/x-frame",
	".mif" : "application/x-mif",
	".mime " : "message/rfc822",
	".mime " : "www/mime",
	".mjf" : "audio/x-vnd.audioexplosion.mjuicemediafile",
	".mjpg " : "video/x-motion-jpeg",
	".mkv " : "video/x-matroska",
	".mk3d " : "audio/x-matroska",
	".mka " : "audio/x-matroska",
	".mks " : "video/x-matroska",
	".mm" : "application/base64",
	".mm" : "application/x-meme",
	".mme" : "application/base64",
	".mod" : "audio/mod",
	".mod" : "audio/x-mod",
	".moov" : "video/quicktime",
	".mov" : "video/quicktime",
	".movie" : "video/x-sgi-movie",
	".mp2" : "audio/mpeg",
	".mp2" : "audio/x-mpeg",
	".mp2" : "video/mpeg",
	".mp2" : "video/x-mpeg",
	".mp2" : "video/x-mpeq2a",
	".mp3" : "audio/mpeg3",
	".mp3" : "audio/x-mpeg-3",
	".mp3" : "video/mpeg",
	".mp3" : "video/x-mpeg",
	".mp4" : "video/mp4",
	".mpa" : "audio/mpeg",
	".mpa" : "video/mpeg",
	".mpc" : "application/x-project",
	".mpe" : "video/mpeg",
	".mpeg" : "video/mpeg",
	".mpg" : "audio/mpeg",
	".mpg" : "video/mpeg",
	".mpga" : "audio/mpeg",
	".mpp" : "application/vnd.ms-project",
	".mpt" : "application/x-project",
	".mpv" : "application/x-project",
	".mpx" : "application/x-project",
	".mrc" : "application/marc",
	".ms" : "application/x-troff-ms",
	".mv" : "video/x-sgi-movie",
	".my" : "audio/make",
	".mzz" : "application/x-vnd.audioexplosion.mzz",
	".nap" : "image/naplps",
	".naplps" : "image/naplps",
	".nc" : "application/x-netcdf",
	".ncm" : "application/vnd.nokia.configuration-message",
	".nif" : "image/x-niff",
	".niff" : "image/x-niff",
	".nix" : "application/x-mix-transfer",
	".nsc" : "application/x-conference",
	".nvd" : "application/x-navidoc",
	".o" : "application/octet-stream",
	".oda" : "application/oda",
	".omc" : "application/x-omc",
	".omcd" : "application/x-omcdatamaker",
	".omcr" : "application/x-omcregerator",
	".ogv" : "video/ogg",
	".p" : "text/x-pascal",
	".p10" : "application/pkcs10",
	".p10" : "application/x-pkcs10",
	".p12" : "application/pkcs-12",
	".p12" : "application/x-pkcs12",
	".p7a" : "application/x-pkcs7-signature",
	".p7c" : "application/pkcs7-mime",
	".p7c" : "application/x-pkcs7-mime",
	".p7m" : "application/pkcs7-mime",
	".p7m" : "application/x-pkcs7-mime",
	".p7r" : "application/x-pkcs7-certreqresp",
	".p7s" : "application/pkcs7-signature",
	".part " : "application/pro_eng",
	".pas" : "text/pascal",
	".pbm " : "image/x-portable-bitmap",
	".pcl" : "application/vnd.hp-pcl",
	".pcl" : "application/x-pcl",
	".pct" : "image/x-pict",
	".pcx" : "image/x-pcx",
	".pdb" : "chemical/x-pdb",
	".pdf" : "application/pdf",
	".pfunk" : "audio/make",
	".pfunk" : "audio/make.my.funk",
	".pgm" : "image/x-portable-graymap",
	".pgm" : "image/x-portable-greymap",
	".pic" : "image/pict",
	".pict" : "image/pict",
	".pkg" : "application/x-newton-compatible-pkg",
	".pko" : "application/vnd.ms-pki.pko",
	".pl" : "text/plain",
	".pl" : "text/x-script.perl",
	".plx" : "application/x-pixclscript",
	".pm" : "image/x-xpixmap",
	".pm" : "text/x-script.perl-module",
	".pm4 " : "application/x-pagemaker",
	".pm5" : "application/x-pagemaker",
	".png" : "image/png",
	".pnm" : "application/x-portable-anymap",
	".pnm" : "image/x-portable-anymap",
	".pot" : "application/mspowerpoint",
	".pot" : "application/vnd.ms-powerpoint",
	".pov" : "model/x-pov",
	".ppa" : "application/vnd.ms-powerpoint",
	".ppm" : "image/x-portable-pixmap",
	".pps" : "application/mspowerpoint",
	".pps" : "application/vnd.ms-powerpoint",
	".ppt" : "application/mspowerpoint",
	".ppt" : "application/powerpoint",
	".ppt" : "application/vnd.ms-powerpoint",
	".ppt" : "application/x-mspowerpoint",
	".ppz" : "application/mspowerpoint",
	".pre" : "application/x-freelance",
	".prt" : "application/pro_eng",
	".ps" : "application/postscript",
	".psd" : "application/octet-stream",
	".pvu" : "paleovu/x-pv",
	".pwz " : "application/vnd.ms-powerpoint",
	".py " : "text/x-script.phyton",
	".pyc " : "applicaiton/x-bytecode.python",
	".qcp " : "audio/vnd.qcelp",
	".qd3 " : "x-world/x-3dmf",
	".qd3d " : "x-world/x-3dmf",
	".qif" : "image/x-quicktime",
	".qt" : "video/quicktime",
	".qtc" : "video/x-qtc",
	".qti" : "image/x-quicktime",
	".qtif" : "image/x-quicktime",
	".ra" : "audio/x-pn-realaudio",
	".ra" : "audio/x-pn-realaudio-plugin",
	".ra" : "audio/x-realaudio",
	".ram" : "audio/x-pn-realaudio",
	".ras" : "application/x-cmu-raster",
	".ras" : "image/cmu-raster",
	".ras" : "image/x-cmu-raster",
	".rast" : "image/cmu-raster",
	".rexx " : "text/x-script.rexx",
	".rf" : "image/vnd.rn-realflash",
	".rgb " : "image/x-rgb",
	".rm" : "application/vnd.rn-realmedia",
	".rm" : "audio/x-pn-realaudio",
	".rmi" : "audio/mid",
	".rmm " : "audio/x-pn-realaudio",
	".rmp" : "audio/x-pn-realaudio",
	".rmp" : "audio/x-pn-realaudio-plugin",
	".rng" : "application/ringing-tones",
	".rng" : "application/vnd.nokia.ringing-tone",
	".rnx " : "application/vnd.rn-realplayer",
	".roff" : "application/x-troff",
	".rp " : "image/vnd.rn-realpix",
	".rpm" : "audio/x-pn-realaudio-plugin",
	".rt" : "text/richtext",
	".rt" : "text/vnd.rn-realtext",
	".rtf" : "application/rtf",
	".rtf" : "application/x-rtf",
	".rtf" : "text/richtext",
	".rtx" : "application/rtf",
	".rtx" : "text/richtext",
	".rv" : "video/vnd.rn-realvideo",
	".s" : "text/x-asm",
	".s3m " : "audio/s3m",
	".saveme" : "application/octet-stream",
	".sbk " : "application/x-tbook",
	".scm" : "application/x-lotusscreencam",
	".scm" : "text/x-script.guile",
	".scm" : "text/x-script.scheme",
	".scm" : "video/x-scm",
	".sdml" : "text/plain",
	".sdp " : "application/sdp",
	".sdp " : "application/x-sdp",
	".sdr" : "application/sounder",
	".sea" : "application/sea",
	".sea" : "application/x-sea",
	".set" : "application/set",
	".sgm " : "text/sgml",
	".sgm " : "text/x-sgml",
	".sgml" : "text/sgml",
	".sgml" : "text/x-sgml",
	".sh" : "application/x-bsh",
	".sh" : "application/x-sh",
	".sh" : "application/x-shar",
	".sh" : "text/x-script.sh",
	".shar" : "application/x-bsh",
	".shar" : "application/x-shar",
	".shtml " : "text/html",
	".shtml" : "text/x-server-parsed-html",
	".sid" : "audio/x-psid",
	".sit" : "application/x-sit",
	".sit" : "application/x-stuffit",
	".skd" : "application/x-koan",
	".skm " : "application/x-koan",
	".skp " : "application/x-koan",
	".skt " : "application/x-koan",
	".sl " : "application/x-seelogo",
	".smi " : "application/smil",
	".smil " : "application/smil",
	".snd" : "audio/basic",
	".snd" : "audio/x-adpcm",
	".sol" : "application/solids",
	".spc " : "application/x-pkcs7-certificates",
	".spc " : "text/x-speech",
	".spl" : "application/futuresplash",
	".spr" : "application/x-sprite",
	".sprite " : "application/x-sprite",
	".src" : "application/x-wais-source",
	".ssi" : "text/x-server-parsed-html",
	".ssm " : "application/streamingmedia",
	".sst" : "application/vnd.ms-pki.certstore",
	".step" : "application/step",
	".stl" : "application/sla",
	".stl" : "application/vnd.ms-pki.stl",
	".stl" : "application/x-navistyle",
	".stp" : "application/step",
	".sv4cpio" : "application/x-sv4cpio",
	".sv4crc" : "application/x-sv4crc",
	".svf" : "image/vnd.dwg",
	".svf" : "image/x-dwg",
	".svr" : "application/x-world",
	".svr" : "x-world/x-svr",
	".swf" : "application/x-shockwave-flash",
	".t" : "application/x-troff",
	".talk" : "text/x-speech",
	".tar" : "application/x-tar",
	".tbk" : "application/toolbook",
	".tbk" : "application/x-tbook",
	".tcl" : "application/x-tcl",
	".tcl" : "text/x-script.tcl",
	".tcsh" : "text/x-script.tcsh",
	".tex" : "application/x-tex",
	".texi" : "application/x-texinfo",
	".texinfo" : "application/x-texinfo",
	".text" : "application/plain",
	".text" : "text/plain",
	".tgz" : "application/gnutar",
	".tgz" : "application/x-compressed",
	".tif" : "image/tiff",
	".tif" : "image/x-tiff",
	".tiff" : "image/tiff",
	".tiff" : "image/x-tiff",
	".tr" : "application/x-troff",
	".tsi" : "audio/tsp-audio",
	".tsp" : "application/dsptype",
	".tsp" : "audio/tsplayer",
	".tsv" : "text/tab-separated-values",
	".turbot" : "image/florian",
	".txt" : "text/plain",
	".uil" : "text/x-uil",
	".uni" : "text/uri-list",
	".unis" : "text/uri-list",
	".unv" : "application/i-deas",
	".uri" : "text/uri-list",
	".uris" : "text/uri-list",
	".ustar" : "application/x-ustar",
	".ustar" : "multipart/x-ustar",
	".uu" : "application/octet-stream",
	".uu" : "text/x-uuencode",
	".uue" : "text/x-uuencode",
	".vcd" : "application/x-cdlink",
	".vcs" : "text/x-vcalendar",
	".vda" : "application/vda",
	".vdo" : "video/vdo",
	".vew " : "application/groupwise",
	".viv" : "video/vivo",
	".viv" : "video/vnd.vivo",
	".vivo" : "video/vivo",
	".vivo" : "video/vnd.vivo",
	".vmd " : "application/vocaltec-media-desc",
	".vmf" : "application/vocaltec-media-file",
	".voc" : "audio/voc",
	".voc" : "audio/x-voc",
	".vos" : "video/vosaic",
	".vox" : "audio/voxware",
	".vqe" : "audio/x-twinvq-plugin",
	".vqf" : "audio/x-twinvq",
	".vql" : "audio/x-twinvq-plugin",
	".vrml" : "application/x-vrml",
	".vrml" : "model/vrml",
	".vrml" : "x-world/x-vrml",
	".vrt" : "x-world/x-vrt",
	".vsd" : "application/x-visio",
	".vst" : "application/x-visio",
	".vsw " : "application/x-visio",
	".w60" : "application/wordperfect6.0",
	".w61" : "application/wordperfect6.1",
	".w6w" : "application/msword",
	".wav" : "audio/wav",
	".wav" : "audio/x-wav",
	".wb1" : "application/x-qpro",
	".wbmp" : "image/vnd.wap.wbmp",
	".web" : "application/vnd.xara",
	".webm" : "video/webm",
	".wiz" : "application/msword",
	".wk1" : "application/x-123",
	".wmf" : "windows/metafile",
	".wml" : "text/vnd.wap.wml",
	".wmlc " : "application/vnd.wap.wmlc",
	".wmls" : "text/vnd.wap.wmlscript",
	".wmlsc " : "application/vnd.wap.wmlscriptc",
	".word " : "application/msword",
	".wp" : "application/wordperfect",
	".wp5" : "application/wordperfect",
	".wp5" : "application/wordperfect6.0",
	".wp6 " : "application/wordperfect",
	".wpd" : "application/wordperfect",
	".wpd" : "application/x-wpwin",
	".wq1" : "application/x-lotus",
	".wri" : "application/mswrite",
	".wri" : "application/x-wri",
	".wrl" : "application/x-world",
	".wrl" : "model/vrml",
	".wrl" : "x-world/x-vrml",
	".wrz" : "model/vrml",
	".wrz" : "x-world/x-vrml",
	".wsc" : "text/scriplet",
	".wsrc" : "application/x-wais-source",
	".wtk " : "application/x-wintalk",
	".xbm" : "image/x-xbitmap",
	".xbm" : "image/x-xbm",
	".xbm" : "image/xbm",
	".xdr" : "video/x-amt-demorun",
	".xgz" : "xgl/drawing",
	".xif" : "image/vnd.xiff",
	".xl" : "application/excel",
	".xla" : "application/excel",
	".xla" : "application/x-excel",
	".xla" : "application/x-msexcel",
	".xlb" : "application/excel",
	".xlb" : "application/vnd.ms-excel",
	".xlb" : "application/x-excel",
	".xlc" : "application/excel",
	".xlc" : "application/vnd.ms-excel",
	".xlc" : "application/x-excel",
	".xld " : "application/excel",
	".xld " : "application/x-excel",
	".xlk" : "application/excel",
	".xlk" : "application/x-excel",
	".xll" : "application/excel",
	".xll" : "application/vnd.ms-excel",
	".xll" : "application/x-excel",
	".xlm" : "application/excel",
	".xlm" : "application/vnd.ms-excel",
	".xlm" : "application/x-excel",
	".xls" : "application/excel",
	".xls" : "application/vnd.ms-excel",
	".xls" : "application/x-excel",
	".xls" : "application/x-msexcel",
	".xlt" : "application/excel",
	".xlt" : "application/x-excel",
	".xlv" : "application/excel",
	".xlv" : "application/x-excel",
	".xlw" : "application/excel",
	".xlw" : "application/vnd.ms-excel",
	".xlw" : "application/x-excel",
	".xlw" : "application/x-msexcel",
	".xm" : "audio/xm",
	".xml" : "application/xml",
	".xml" : "text/xml",
	".xmz" : "xgl/movie",
	".xpix" : "application/x-vnd.ls-xpix",
	".xpm" : "image/x-xpixmap",
	".xpm" : "image/xpm",
	".x-png" : "image/png",
	".xsr" : "video/x-amt-showrun",
	".xwd" : "image/x-xwd",
	".xwd" : "image/x-xwindowdump",
	".xyz" : "chemical/x-pdb",
	".z" : "application/x-compress",
	".z" : "application/x-compressed",
	".zip" : "application/x-compressed",
	".zip" : "application/x-zip-compressed",
	".zip" : "application/zip",
	".zip" : "multipart/x-zip",
	".zoo" : "application/octet-stream",
	".zsh" : "text/x-script.zsh"
};
/***
 * utils.Mime
 */
exports.Mime = function(pathname) {
	if(testType[path.extname(pathname)]) {
		return testType[path.extname(pathname)]
	} else {
		return "application/octet-stream"
	}
}
