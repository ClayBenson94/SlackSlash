'use strict';

const hapi = require('hapi');
const axios = require('axios');
require('dotenv').config();

// Create a server with a host and port
const server = hapi.server({
    port: 5337
});

// Add the route
server.route({
    method: 'POST',
    path: '/slackslash',
    handler: async (request, h) => {
		console.log(request.payload);
        if (request.payload && request.payload.token === process.env.SLACK_TOKEN) {
            const response_url = request.payload.response_url;
			await axios({
				method: 'post',
				url: response_url,
				data: {
					response_type: "in_channel",
					text: `<@${request.payload.user_id}> says ${request.payload.text.length > 0 ? request.payload.text : 'nothing'}!`
				}
			});
			return h.response().code(200);
        } else {
			return h.code(401);
		}
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
