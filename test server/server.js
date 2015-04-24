var rhizome = require('/rhizome/rhizome.js');
console.log("hello world");

var path = require('path');

module.exports = {
	http: {
		staticDir: path.join(__dirname,'/pages'),
		port: 80
	},
	websockets: {},
}

rhizome.start(function(err) {
	rhizome.send('/sys/subscribe', ['/']);
	console.log("started?");
} );