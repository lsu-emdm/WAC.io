// ************************************************

// NEXUS Node Server 
//				Jesse Allison (2015)
// 
//	To Launch:
//		NODE_ENV=production sudo node nexus-server.js 
//		(sudo is required to launch on port 80.)

// ************************************************


	// Setup web app - using express to serve pages
var express = require('express'),
		sio = require('socket.io'),
		http = require('http');
		
var app = express();
		// set up express web application
	app.configure(function () {
		app.use(express.static(__dirname + '/public'));
		app.use(app.router);
	});

		// FIXME: probably don't need this
	app.get('/', function (req, res) {
		res.send('hello');
	});

	//	OSC Setup for sending (and receiving) OSC (to Max)
var osc = require('node-osc');
		// oscServer is used for receiving osc messages (from Max)
var oscServer = new osc.Server(7746, '127.0.0.1');
oscServer.on("message", function (msg, rinfo) {
			// console.log("OSC message:");
			// console.log(msg);
					// Setup messages to receive here //
	if(msg[0] = "/goToSection") {
		currentSection = msg[1];
		shareSection(currentSection);
	}
});

		// oscClient is used to send osc messages (to Max)
var oscClient = new osc.Client('127.0.0.1', 7745);


	// server is the node server (web app via express)
		// this code launches the server on port 80 and switches the user id away from sudo
		// apparently this makes it more secure - if something goes awry it isn't running under the superuser.
var server = http.createServer(app)
	.listen(8000, function(err) {
		if (err) return cb(err);

		// Find out which user used sudo through the environment variable
		var uid = parseInt(process.env.SUDO_UID);
		// Set our server's uid to that user
		if (uid) process.setuid(uid);
		console.log('Server\'s UID is now ' + process.getuid());
	});

		// start socket.io listening on the server
var io = sio.listen(server);


// *********************
	// Global Variables!

var ioClients = [];		// list of clients who have logged in.
var currentSection = 0;		// current section.

// *********************

	// Respond to web sockets with socket.on
io.sockets.on('connection', function (socket) {
	var ioClientCounter = 0;		// Can I move this outside into global vars?
	
	socket.on('addme',function(username) {
		if(username != "admin") {	
			ioClients.push(socket.id);
		}
		socket.username = username;  // allows the username to be retrieved anytime the socket is used
		// Can add any other pertinent details to the socket to be retrieved later
		// socket.location, etc.
		var userColor = "#0af";
		socket.userColor = userColor;
			// .emit to send message back to caller.
		socket.emit('chat', 'SERVER', 'You have connected');
		// .broadcast to send message to all sockets.
		//socket.broadcast.emit('chat', 'SERVER', username + ' is on deck');
		socket.emit('bump', socket.username, "::dude::");
		var title = getSection(currentSection);
		socket.emit('setSection', currentSection, title);
	});
	
	 socket.on('disconnect', function() {
			// ioClients.remove(socket.id);	// FIXME: Remove client if they leave
			io.sockets.emit('chat', 'SERVER', socket.username + ' has left the building');
	 });

	 socket.on('sendchat', function(data) {
		// Transmit to everyone who is connected //
			io.sockets.emit('chat', socket.username, data);
	 });

	socket.on('tap', function(data) {
		console.log("Data: ", data.inspect);
		
		oscClient.send('/tapped', 1);
		
		socket.broadcast.emit('tapped', socket.username, 1);
	});
	
	socket.on('shareToggle', function(data) {
		socket.broadcast.emit('setSharedToggle', data);
	});
	
	socket.on('location', function(data) {
		if(data) {
			oscClient.send('/location', data[0], data[1]);
		}
	});
	
	socket.on('slider', function(data) {
		console.log("slider! " + data);
		
		oscClient.send('/slider', socket.username, data);
	});

			
			// Return random user name
	socket.on('getSomebody', function(data) {
		console.log("Get Somebody! ");
				
		var user = getNextUser();
					// Make sure you don't get yourself
		if(user.username == socket.username || user.username == null) {
			user = getNextUser();
			if(user.username == socket.username || user.username == null) {
				socket.emit("somebodyToYou","Somebody");
			}
		} else {
			socket.emit("somebodyToYou",user.username);
		}
	});
	
	
	socket.on('section', function(data) {
		console.log("Section: "+ data);
		currentSection = data;
		sendSection(currentSection);
	})

	// *********************
			// Functions for handling stuff

			// **** SECTIONS ****
	var sectionTitles = ["Welcome", "Section 1", "Section 2", "Section 3", "Section 4", "Section 5", "Section 6", "End"];
	
	// Todo: Add sections to correspond to organ interactions
	// sendSection(currentSection);	 // Sets everyone's section
	sendSection = function (sect) {
		var title = getSection(sect);
		
		io.sockets.emit('setSection', sect, title);
		oscClient.send('/setSection', sect, title);
	}
	
		// Section shared from Max to UIs
	shareSection = function(sect) {
		var title = getSection(sect);
		io.sockets.emit('setSection', sect, title);
	}
	
	getSection = function(sect) {
		var title = "none";
		if(sectionTitles.length >= sect) {
			title = sectionTitles[sect];
		} else {
			title = "";
		}
		return title;
	}
		// **** 		****
	
				// pick a random user from those still connected and return the user
	getRandomUser = function() {
		var randomUser = Math.floor(Math.random() * ioClients.length);
		var user = io.sockets.socket(ioClients[randomUser]);
		return user;
	}
	
	getNextUser = function() {
		// console.log("ioClients Length: ", ioClients.length);
		// console.log("io.sockets.socket length: ", io.sockets.socket.length);
		var user = io.sockets.socket(ioClients[ioClientCounter]);
		ioClientCounter = ioClientCounter + 1;
		if (ioClientCounter >= ioClients.length) {
			ioClientCounter = 0;
		}
		// console.log("Username ", user.username);
		
		return user;
	}
	
});

