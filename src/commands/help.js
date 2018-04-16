const respond = require('./commandUtilities').respond;

/**
 * Prints a usage message to the user listing out various commands
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 */
async function help (request, h) {
    return respond(request, h, 'To see more about the commands I support, click my picture in the chat (to the left) and click "About this app"!', false);
}

module.exports = help;
