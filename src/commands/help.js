const respond = require('../utilities/responseUtilities').respond;

/**
 * Prints a usage message to the user listing out various commands
 * @param {*} payload The slack payload object
 * @param {*} h The hapi response toolkit
 */
async function help (payload, h) {
    return respond(payload, h, 'To see more about the commands I support, click my picture in the chat (to the left) and click "About this app"!', false);
}

module.exports = help;
