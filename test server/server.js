var rhizome = require('/rhizome/rhizome');
console.log("hello world");
rhizome.start(function(err) {
	rhizome.send('/sys/subscribe', ['/']);
}

rhizome.on('message', function(address, args) {
	console.log(address+": "+args);
}