'use strict';

const hapi = require('hapi');
const serverHandlers = require('./serverHandlers');

// Create a server with a host and port
const server = hapi.server({
    port: process.env.PORT || 5337
});

// Add the route
server.route({
    method: 'POST',
    path: '/claybot',
    handler: serverHandlers.clayBot
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
