'use strict';

const hapi = require('hapi');
const commandHandler = require('./commands/commandHandler');

// Create a server with a host and port
const server = hapi.server({
    port: process.env.PORT || 5337
});

// Add the route
server.route({
    method: 'POST',
    path: '/claybot',
    handler: (request, h) => {
        const payload = request.payload;
        if (!payload || Object.keys(payload).length === 0) {
            return h.response({
                error: 'Empty payload received'
            }).code(400);
        }
        if (payload.token !== process.env.SLACK_TOKEN) {
            return h.response({
                error: 'Invalid token'
            }).code(401);
        }

        return commandHandler.handleCommand(request, h);
    }
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
