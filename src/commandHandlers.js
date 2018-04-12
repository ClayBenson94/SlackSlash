'use strict';

const axios = require('axios');

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

async function scrabble (request, h, commandText) {
    const payload = request.payload;
    const url = payload.response_url;
    const goodChars = [' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    let output = '';
    for (let i = 0; i < commandText.length; i++) {
        const lowerChar = commandText[i].toLowerCase();
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
        return h.response().code(500);
    }
    return h.response().code(200);
}

async function roshambo (request, h, commandText) {
    const payload = request.payload;
    const url = payload.response_url;

    console.log('ayyyy', payload);

    try {
        await axios({
            method: 'post',
            url: url,
            data: {
                response_type: 'in_channel',
                text: 'ay'
            }
        });
    } catch (e) {
        return h.response().code(500);
    }
    return h.response().code(200);
}

async function help (request, h) {
    const payload = request.payload;
    const url = payload.response_url;

    try {
        await axios({
            method: 'post',
            url: url,
            data: {
                response_type: 'ephemeral',
                attachments: [
                    {
                        fallback: 'Usage message for ClayBot',
                        color: '#36a64f',
                        pretext: 'The following commands are available',
                        fields: [
                            {
                                title: 'help',
                                value: 'Print this message',
                                short: false
                            },
                            {
                                title: 'scrabble [text]',
                                value: 'Turns [text] into scrabble letters',
                                short: false
                            }
                        ],
                        footer: 'ClayBot'
                    }
                ]
            }
        });
    } catch (e) {
        return h.response().code(500);
    }
    return h.response().code(200);
}

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
