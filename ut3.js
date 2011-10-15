var io = require('socket.io');
var spawn = require('child_process');

// ############################################################
// Globals
// ############################################################
var Config = {
	host: "ec2-67-202-34-109.compute-1.amazonaws.com",
	port: 9000,
	home: "/home/ubuntu/ut3-dedicated/Binaries",
	url: function(){ return "http://" + this.host + ":" + this.port; },
}

var socket = io.connect(Config.url());

// ############################################################
// Events
// ############################################################
socket.on('start')
{
	
	
}




