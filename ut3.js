//var io = require('socket.io');
var io = require('./node_modules/node-socket.io-client/socket.io').io;
var child = require('child_process');

// ############################################################
// Globals
// ############################################################
var Config = {
	host: "ec2-67-202-34-109.compute-1.amazonaws.com",
	port: 9000,
	home: "/home/ubuntu/ut3-dedicated/Binaries",
	url: function(){ return "http://" + this.host + ":" + this.port; },
	ut3: "/home/ubuntu/ut3-dedicated/ut3",
	arguments: [
		"server",
	],
	level: 'DM-Heatray',
	interval: 5000,
}

var socket = {};
var connected =false;

// ############################################################
// Callbacks
// ############################################################

// Start the UT3 server
function onStart(data)
{
  var args = Config.arguments ;

  // If we specified a leve
  var level ;
  if(data.level)
    level = data.level;
  else
    level = Config.level; 

  //Configure UT3 server parameters
  var parameters = []; 
  var password = generateGUID();
  parameters.push("password="+password);

  var paramString = generateArgString(level,parameters);
  args.push(paramString);

  var p = child.exec(Config.ut3,args,execCB);

  //Configure the return message
  var message = { 
    password: password,
  }

  socket.emit('started',message);
  
}

function onDisconnect(data)
{
	console.log('Disconnected');
	var connected=false;
}

function onConnect(data)
{
	console.log('Connected to ' + Config.url());
	var connected=true;
}

// Start the UT3 server
function execCB (error,stdout,stderr)
{
	console.log(stdout);
}

// Attempt to connect to the server
function connect(){
	var options = { port: Config.port };
	console.log('Attempting to connect to ' + Config.url());
	socket = new io.Socket(Config.url(),options);
	socket.connect();
	socket.on('start',onStart);
	socket.on('disconnect',onDisconnect);
	socket.on('connect',onConnect);
}

// ############################################################
// Utility functions
// ############################################################

/**
 * Generate GUIDs for conferences
 */
function generateGUID() {
	var S4 = function() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	};
	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function generateArgString(level,args){
	var final = level;

	for(var arg in args){
		final += "?" + args[arg];
	}
	return final;
}

// Think
// Check the connection and attempt to reconnect if disconnected
function think()
{
	if(!connected)
		connect();
}

// ############################################################
// "Main"
// ############################################################

// Check the connection to the sever and attempt to connect
// on a timer
setInterval(think,Config.interval);

