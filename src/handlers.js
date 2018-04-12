'use strict';

const axios = require('axios');

async function clayBot (request, h) {
    if (!request.payload || request.payload.token !== process.env.SLACK_TOKEN) {
        return h.code(401);
    }
    const url = request.payload.response_url;
    await axios({
        method: 'post',
        url: url,
        data: {
            response_type: 'in_channel',
            text: `<@${request.payload.user_id}> says ${request.payload.text.length > 0 ? request.payload.text : 'nothing'}!`
        }
    });
    return h.response().code(200);
}

module.exports = {
    clayBot
};
