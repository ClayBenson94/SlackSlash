'use strict';

const commandHandlers = require('./commandHandlers');

async function clayBot (request, h) {
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

    return commandHandlers.handleCommand(request, h);
}

module.exports = {
    clayBot
};
