'use strict';

const axios = require('axios');

/**
 * Responds to the slack `response_url` with the given text. Optionally can respond in channel or ephemerally
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 * @param {*} text The text to respond with
 * @param {*} respondInChannel Whether or not to respond in channel (or ephemeral)
 */
async function respond (request, h, text, respondInChannel) {
    const url = request.payload.response_url;
    try {
        await axios({
            method: 'post',
            url: url,
            data: {
                response_type: respondInChannel ? 'in_channel' : 'ephemeral',
                text: text
            }
        });
    } catch (e) {
        return h.response().code(500);
    }
    return h.response().code(200);
}

/**
 * Responds to the slack `response_url` with the given text. Optionally can respond in channel or ephemerally
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 * @param {*} attachments The attachments object
 * @param {*} respondInChannel Whether or not to respond in channel (or ephemeral)
 */
async function respondAttachments (request, h, attachments, respondInChannel) {
    const url = request.payload.response_url;
    try {
        await axios({
            method: 'post',
            url: url,
            data: {
                response_type: respondInChannel ? 'in_channel' : 'ephemeral',
                attachments: attachments
            }
        });
    } catch (e) {
        return h.response().code(500);
    }
    return h.response().code(200);
}

module.exports = {
    respond,
    respondAttachments
};
