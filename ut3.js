//var io = require('socket.io');
var util = require('util');
var io = require('socket.io-client');
var spawn = require('child_process').spawn;

// ############################################################
// Globals
// ############################################################
var Config = {
	host: "ec2-67-202-34-109.compute-1.amazonaws.com",
	port: 9000,
	home: "/home/ubuntu/ut3-dedicated/Binaries",
	//url: function(){ return "http://" + this.host + ":" + this.port; },
	url: function(){
		return "ws://" + this.host + ":" + this.port; 
	},
	ut3: "ut3",
	exe: function() {
		return this.home + "/" + this.ut3 ;
	},
	arguments: [
		"server",
	],
	level: 'DM-Heatray',
	parameters: {
		MinPlayers: 1,
		password: "",
	},
	getParameters: function(){
	  var final = this.level;
	
	  for(var p in this.parameters){
	    final += "?" + p + "=" + this.parameters[p];
	  }
	  return final;
	},
	interval: 5000,
}

var socket = {};
var connected =false;

// ############################################################
// Callbacks
// ############################################################
function onUT3exit(code)
{
	console.log("UT3 server exited with code "+code);
}

function onUT3stdout(data)
{
	console.log("\tut3 out\t:" + data);
}

function onUT3stderr(data)
{
	console.log("\tut3 err\t:" + data);
}

// Start the UT3 server
function onStart(data)
{
	console.log('Received start request.');
	console.log(data);
  var args = Config.arguments ;

  // If we specified a leve
  var level ;
  if(data.level)
    level = data.level;
  else
    level = Config.level; 

  //Configure UT3 server parameters
  Config.parameters.password = generateGUID();

  args.push(Config.getParameters());

	var ut3 = spawn(Config.exe(),args);
	// reguster ccallbacks
	ut3.on('exit',onUT3exit);
	ut3.stderr.on('data',onUT3stderr);
	ut3.stdout.on('data',onUT3stdout);

	console.log('Started game server process');

  //Configure the return message
  var message = { 
    password: Config.password,
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
	connected=true;
}

// Start the UT3 server
function execCB (error,stdout,stderr)
{
	console.log(stdout);
}

// Attempt to connect to the server
function connect(){
	console.log('Attempting to connect to ' + Config.url());
	socket = new io.connect(Config.url());
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

