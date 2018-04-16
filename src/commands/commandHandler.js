'use strict';

const help = require('./help');
const scrabble = require('./scrabble');
const roshambo = require('./roshambo');

/**
 * Maps the incoming command to the appropriate handler function
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 */
async function handleCommand (request, h) {
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

    switch (payload.command) {
    case '/claybot':
        return help(request, h);
    case '/scrabble':
        return scrabble(request, h, payload.text);
    case '/roshambo':
        return roshambo(request, h, payload.text);
    default:
        return help(request, h);
    }
}

module.exports = {
    handleCommand
};
