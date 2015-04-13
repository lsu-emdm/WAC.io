var path = require('path');

module.exports = {
	http: {
		staticDir: path.join(__dirname,'/pages'),
		port: 80
	},
	websockets: {},
}