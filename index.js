'use strict';

const hapi = require('hapi');
require('dotenv').config();

// Create a server with a host and port
const server = hapi.server({
    port: 5337
});

// Add the route
server.route({
    method: 'POST',
    path: '/slackslash',
    handler: function (request, h) {

        return h.response('yeet').type('text/html').code(200);
    }
});

// Start the server
async function start() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();