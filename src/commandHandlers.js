'use strict';

const axios = require('axios');

function getCommandNameFromText (text) {
    const commandName = text.split(' ')[0];
    if (commandName) {
        return commandName;
    }
    return undefined;
}

async function scrabble (request, h) {
    const payload = request.payload;
    const url = payload.response_url;
    const text = payload.text;

    const goodChars = [' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    const input = text;
    let output = '';
    for (let i = 0; i < input.length; i++) {
        const lowerChar = input[i].toLowerCase();
        if (goodChars.includes(lowerChar)) {
            output += lowerChar === ' ' ? ':--:' : `:-${lowerChar}:`;
        }
    }

    try {
        await axios({
            method: 'post',
            url: url,
            data: {
                response_type: 'in_channel',
                text: output
            }
        });
    } catch (e) {
        // console.error('Error in clayBot handler', e);
        return h.response().code(500);
    }
    return h.response().code(200);
}

async function handleCommand (request, h) {
    const payload = request.payload;

    console.log(getCommandNameFromText(payload.text));

    const commandName = getCommandNameFromText(payload.text);
    switch (commandName) {
    case 'help':
        // do nothing
        break;
    case 'scrabble':
        return scrabble(request, h);
    default:
        // do nothing
        break;
    }
}

module.exports = {
    handleCommand
};
