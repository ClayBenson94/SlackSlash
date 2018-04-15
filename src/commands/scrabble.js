const respond = require('./commandUtilities').respond;

/**
 * Convert text into scrabble emojis
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 * @param {*} commandText The text of the command without the command name
 */
async function scrabble (request, h, commandText) {
    const goodChars = [' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    let output = '';
    for (let i = 0; i < commandText.length; i++) {
        const lowerChar = commandText[i].toLowerCase();
        if (goodChars.includes(lowerChar)) {
            output += lowerChar === ' ' ? ':--:' : `:-${lowerChar}:`;
        }
    }

    if (output.length > 0) {
        return respond(request, h, output, true);
    } else {
        return respond(request, h, 'Scrabble command must be invoked with text', false);
    }
}

module.exports = scrabble;
