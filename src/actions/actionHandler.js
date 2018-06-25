'use strict';

const reported = require('./reported');
const respond = require('./../utilities/responseUtilities').respond;

/**
 * Maps the incoming action to the appropriate handler function
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 */
async function handleAction (request, h) {
    // These payloads are different from command payloads. Not sure why, but it's passed as payload.payload, and is a string ¯\_(ツ)_/¯
    const payload = JSON.parse(request.payload.payload);

    if (!payload || Object.keys(payload).length === 0) {
        return h.response({
            error: 'Empty payload received'
        }).code(400);
    }
    if (payload.token !== process.env.VERIFICATION_TOKEN) {
        return h.response({
            error: 'Invalid token'
        }).code(401);
    }

    try {
        switch (payload.callback_id) {
        case 'report_cops':
            return reported(payload, h);
        default:
            return respond(payload, h, `Invalid action id "${payload.callback_id}"`, false);
        }
    } catch (error) {
        console.error('Error occured in actionHandler.js');
        console.error(error);
        return h.response().code(500);
    }
}

module.exports = {
    handleAction
};
