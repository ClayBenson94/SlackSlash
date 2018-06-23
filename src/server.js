'use strict';

const hapi = require('hapi');
const commandHandler = require('./commands/commandHandler');
const actionHandler = require('./actions/actionHandler');

// Create a server with a host and port
const server = hapi.server({
    port: process.env.PORT || 5337
});

// Add the routes
server.route({
    method: 'POST',
    path: '/claybot',
    handler: commandHandler.handleCommand
});
server.route({
    method: 'POST',
    path: '/claybot-action',
    handler: actionHandler.handleAction
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
