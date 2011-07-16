var os = require('os');

var OS = module.exports = function(updateTime) {

	this.cpus = os.cpus();
	this.hostname = os.hostname();
	this.type = os.type();
	this.release = os.release();
	this.uptime = os.uptime();
	this.loadavg = os.loadavg();
	this.totalmem = os.totalmem();
	this.freemem = os.freemem();
	this.timer = typeof(updateTime) == 'number' ? updateTime * 1000  : false;
	
	
	this.timerUpdate()
	
	var self = this;
	var oldTimer = updateTime;
	this.stop = function(){
		if(oldTimer && this.timer){
			this.timer = false;
		}
	}
	this.start = function(){
		if(oldTimer && !this.timer){
			this.timer = oldTimer;
		}
	}
};
OS.prototype.timerUpdate = function() {
	var self = this;
	if(self.timer) {
		setTimeout( function() {
			self.update();
			self.timerUpdate()
		},this.timer)
	}
}
OS.prototype.update = function() {
	console.log('OS.TIMMER')
	this.uptime = os.uptime();
	this.loadavg = os.loadavg();
	this.totalmem = os.totalmem();
	this.freemem = os.freemem();
};

var os = new OS;
os.timerUpdate()
module.exports = function(rpc) {
	rpc.expose('sysinfo', function() {
		this.pushResult(os);
		this.send();
	})
}