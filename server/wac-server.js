// ************************************************

// Traversal Node Server (Web Audio v.0.2)
//				Jesse Allison (2015)
// 
//	To Launch:
//		NODE_ENV=production sudo node traversal-node.js 
//

// ************************************************


	// Setup web app - using express to serve pages
var express = require('express'),
		sio = require('socket.io'),
		http = require('http'),
		app = express();

	//	OSC Setup for sending (and receiving) OSC (to Max)
		// oscServer is used for receiving osc messages (from Max)
var osc = require('node-osc');
var oscServer = new osc.Server(3333, '127.0.0.1');
oscServer.on("message", function (msg, rinfo) {
			console.log("OSC message:");
			console.log(msg);
					// Setup messages to receive here //
	if(msg[0] = "/goToSection") {
		traversalSection = msg[1];
		shareSection(traversalSection);
	}
});
		// oscClient is used to send osc messages (to Max)
var oscClient = new osc.Client('127.0.0.1', 7745);


	// server is the node server (via express)
		// this code launches the server on port 80 and switches the user id away from sudo
		// apparently this makes it more secure - if something goes awry it isn't the superuser!
var server = http.createServer(app)
	.listen(80, function(err) {
		if (err) return cb(err);

		// Find out which user used sudo through the environment variable
		var uid = parseInt(process.env.SUDO_UID);
		// Set our server's uid to that user
		if (uid) process.setuid(uid);
		console.log('Server\'s UID is now ' + process.getuid());
	});

	// FIXME: Can I move this up with app definition?
app.configure(function () {
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
});

	// FIXME: probably don't need this
app.get('/', function (req, res) {
	res.send('hello');
});

var io = sio.listen(server);

// *********************
	// Global Variables!

var ioClients = [];		// list of clients who have logged in.
var traversalSection = 0;		// current section.

// *********************

	// Respond to web sockets with socket.on
io.sockets.on('connection', function (socket) {
	var ioClientCounter = 0;		// Can I move this outside into global vars?
	
	socket.on('addme',function(username) {
		if(username != "admin") {	
			ioClients.push(socket.id);
		}
		socket.username = username;
		// socket.initials = username.parseInitials;	// Must implement...
		var userColor = "#0af";
		socket.userColor = userColor;
		socket.emit('chat', 'SERVER', 'You have connected');
		socket.broadcast.emit('chat', 'SERVER', username + ' is on deck');
		socket.emit('bump', socket.username, "::dude::");
		// sendSection(traversalSection);	 // Sets everyone's section
		var title = getSection(traversalSection);
		socket.emit('setSection', traversalSection, title);
	});
	
	 socket.on('disconnect', function() {
			// ioClients.remove(socket.id);	// FIXME: Remove client if they leave
			io.sockets.emit('chat', 'SERVER', socket.username + ' has left the building');
	 });

	 socket.on('sendchat', function(data) {
		// Transmit to everyone who is connected //
			io.sockets.emit('chat', socket.username, data);
	 });

	socket.on('bumped', function(data) {
		console.log("Data: ", data.inspect);
		
		oscClient.send('/bump', 1);
		
		socket.broadcast.emit('bump', socket.username, 1);
	});
	
	
	socket.on('startTraversal', function(data) {
		console.log("Start! " + data);
		
		oscClient.send('/start', data);
	});
	socket.on('endSection3', function(data) {
		console.log("endSection3! " + data);
		
		oscClient.send('/endSection3', data);
	});
	
	socket.on('triggerEvent', function(data) {
		console.log("triggerEvent! " + data);
		
		oscClient.send('/triggerEvent', data);
	});
	
	
	socket.on('popBlit', function(data) {
		console.log("pop! " + data);
		
		oscClient.send('/popBlit', data);
	});
	
	socket.on('noPopBlit', function(x,y) {
		console.log("noPop! " + x , y, socket.username);
		var user = getNextUser();
		user.emit("makeBlit",x,y,socket.username);
		// oscClient.send('/popBlit', data);
	});
	
	socket.on('explodeBlot', function(data) {
		console.log("Exploded! " + data);
		
		oscClient.send('/exploded', data);
	});
			
			// TODO: Add location of user you are connecting with...
	socket.on('connected', function(data) {
		console.log("Connected! ");
		
		oscClient.send('/connected', socket.username);
		
		var user = getNextUser();
					// Make sure you don't connect with yourself
		if(user.username == socket.username || user.username == null) {
			user = getNextUser();
			if(user.username == socket.username || user.username == null) {
				socket.emit("connectWith","Holden");
			}
		} else {
			socket.emit("connectWith",user.username);
		}
	});
	
	
	socket.on('section', function(data) {
		console.log("Section: "+ data);
		traversalSection = data;
		sendSection(traversalSection);
	})

	// *********************
			// Functions for handling stuff

	// Todo: Add sections to correspond to organ interactions
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
		if(sect == 1) {
			title = "Hold until burst";
		} else if (sect == 2) {
			title = "Tap Blit to Pop, Anywhere to send a Blit";
		} else if (sect == 3) {
			title = "Connect with Others";
		} else if (sect == 4) {
			title = "Tap Blit to Pop, Anywhere to send a Blit";
		} else if (sect == 5) {
			title = "Drag and Connect with Others";
		} else if (sect == 6) {
			title = "The End (thank you)";
		} else if (sect == 0) {
			title = "<- Device Audio Toggle (Only use with Newer Devices)";
		}
		return title;
	}
	
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

