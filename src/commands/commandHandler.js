'use strict';

const help = require('./help');
const scrabble = require('./scrabble');
const roshambo = require('./roshambo');

/**
 * Gets info about a specific command, splitting off the command name and the remaining text into 2 properties
 * @param {*} text The input text from the user
 */
function getCommandInfo (text) {
    const splitText = text.split(' ');
    const commandName = splitText[0];
    if (commandName) {
        return {
            commandName: commandName,
            commandText: splitText.slice(1).join(' ')
        };
    }
    // Default to 'help'
    return {
        commandName: 'help',
        commandText: ''
    };
}

/**
 * Maps the incoming command to the appropriate handler function
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 */
async function handleCommand (request, h) {
    const payload = request.payload;

    const commandInfo = getCommandInfo(payload.text);
    switch (commandInfo.commandName) {
    case 'help':
        return help(request, h);
    case 'scrabble':
        return scrabble(request, h, commandInfo.commandText);
    case 'roshambo':
        return roshambo(request, h, commandInfo.commandText);
    default:
        return help(request, h);
    }
}

module.exports = {
    handleCommand
};
