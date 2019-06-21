'use strict';

const hapi = require('hapi');
const commandHandler = require('./commands/commandHandler');

// Create a server with a host and port
const server = hapi.server({
	port: process.env.PORT || 5337
});

// Add the routes
server.route({
	method: 'POST',
	path: '/slackslash',
	handler: commandHandler.handleCommand
});

// Start the server
async function start () {
	try {
		await server.start();
	} catch (err) {
		console.log(err);
		process.exit(1);
	}

	console.log('Server running at:', server.info.uri);
};

module.exports = {
	start
};
