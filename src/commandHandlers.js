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
    return undefined;
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

async function help (request, h) {
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
                attachments: [
                    {
                        fallback: 'Required plain-text summary of the attachment.',
                        color: '#36a64f',
                        pretext: 'The following commands are available',
                        author_name: '',
                        author_link: '',
                        author_icon: '',
                        title: '',
                        title_link: '',
                        text: '',
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
                        image_url: 'http://my-website.com/path/to/image.jpg',
                        thumb_url: 'http://example.com/path/to/thumb.png',
                        footer: 'ClayBot',
                        footer_icon: '',
                        ts: null
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
        // do nothing
        break;
    case 'scrabble':
        return scrabble(request, h, commandInfo.commandText);
    default:
        // do nothing
        break;
    }
}

module.exports = {
    handleCommand
};
