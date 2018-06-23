const respond = require('../utilities/responseUtilities').respond;

/**
 * Convert text into scrabble emojis
 * @param {*} payload The slack payload object
 * @param {*} h The hapi response toolkit
 */
async function scrabble (payload, h) {
    const commandText = payload.text;
    const goodChars = [' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    let output = '';
    for (let i = 0; i < commandText.length; i++) {
        const lowerChar = commandText[i].toLowerCase();
        if (goodChars.includes(lowerChar)) {
            output += lowerChar === ' ' ? ':--:' : `:-${lowerChar}:`;
        }
    }

    if (output.length > 0) {
        return respond(payload, h, `<@${payload.user_id}>\n${output}`, true);
    } else {
        return respond(payload, h, 'Scrabble command must be invoked with text', false);
    }
}

module.exports = scrabble;
