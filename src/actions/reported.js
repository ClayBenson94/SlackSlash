const respond = require('../utilities/responseUtilities').respond;

/**
 * Handles 'reported' commands.
 * @param {*} payload The slack payload object
 * @param {*} h The hapi response toolkit
 */
async function reported (payload, h) {
    if (payload.message.user) {
        return respond(payload, h, `🚨WEE WOO WEE WOO🚨\n👮🚓<@${payload.message.user}> has been reported! Put your hands behind your back!🚓👮‍♀️`, true);
    } else if (payload.message.bot_id) {
        return respond(payload, h, `Bots cannot be reported! Bots are the law!`, true);
    }
}

module.exports = reported;
