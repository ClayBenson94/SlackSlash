'use strict';

const axios = require('axios');

async function clayBot (request, h) {
    if (!request.payload) {
        return h.code(400);
    }
    if (request.payload.token !== process.env.SLACK_TOKEN) {
        return h.code(401);
    }
    if (!request.payload.response_url) {
        return h.code(400);
    }

    const url = request.payload.response_url;
    try {
        await axios({
            method: 'post',
            url: url,
            data: {
                response_type: 'in_channel',
                text: `<@${request.payload.user_id}> says ${request.payload.text.length > 0 ? request.payload.text : 'nothing'}!`
            }
        });
    } catch (e) {
        console.error('Error in clayBot handler', e);
        return h.response().code(500);
    }
    return h.response().code(200);
}

module.exports = {
    clayBot
};
