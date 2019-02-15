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
        url: 'https://cat-fact.herokuapp.com/facts',
    });
    const allFacts = response.data.all;
    const randomFact = allFacts[Math.floor(Math.random()*allFacts.length)].text;
    return respond(payload, h, `<@${payload.user_id}>'s cat fact:\n${randomFact}`, true);
}

module.exports = catfact;
