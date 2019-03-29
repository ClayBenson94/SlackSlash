const respond = require('../utilities/responseUtilities').respond;
const axios = require('axios');

/**
 * Vomit out a random cat fact
 * @param {*} payload The slack payload object
 * @param {*} h The hapi response toolkit
 */
async function catfact(payload, h) {
    const response = await axios({
        method: 'GET',
        url: 'https://cat-fact.herokuapp.com/facts/random',
    });
    const factText = response.data.text;
    return respond(payload, h, `<@${payload.user_id}>'s cat fact:\n${factText}`, true);
}

module.exports = catfact;
