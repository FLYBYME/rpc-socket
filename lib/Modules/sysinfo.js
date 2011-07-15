var os = require('os');

var OS = function(updateTime) {

	this.cpus = os.cpus();
	this.hostname = os.hostname();
	this.type = os.type();
	this.release = os.release();
	this.uptime = os.uptime();
	this.loadavg = os.loadavg();
	this.totalmem = os.totalmem();
	this.freemem = os.freemem();
	return this;
};

module.exports = function(rpc) {
	rpc.expose('sysinfo', function() {
		this.pushResult(new OS());
		this.send();
	})
}