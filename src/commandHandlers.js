'use strict';

const axios = require('axios');

// Test game between Calvin (initiator) and Clay (recipient)
// let roshamboGames = [
//     {
//         initiatingPlayer: 'U5FQVBB4Y',
//         targetPlayer: 'U69CFAWS0',
//         initialMove: 'rock'
//     }
// ];
let roshamboGames = [];

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

async function respond (request, h, text, respondInChannel) {
    const url = request.payload.response_url;
    try {
        await axios({
            method: 'post',
            url: url,
            data: {
                response_type: respondInChannel ? 'in_channel' : 'ephemeral',
                text: text
            }
        });
    } catch (e) {
        return h.response().code(500);
    }
    return h.response().code(200);
}

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

// roshamboGames.push({
//     initiatingPlayer: currentPlayer,
//     targetPlayer: targetPlayer,
//     initialMove: move
// });
async function roshambo (request, h, commandText) {
    const roshamboRegex = /(rock|paper|scissors)\s<@(\w+)?\|?(\w+)?>/igm;
    if (!roshamboRegex.test(commandText)) {
        return respond(request, h, 'Roshambo must initiated with `/claybot roshambo [rock|paper|scissors] [@username]`', false);
    }
    roshamboRegex.lastIndex = 0; // reset regex due to /g flag
    const matches = roshamboRegex.exec(commandText);

    const move = matches[1].toLowerCase();
    const currentPlayer = request.payload.user_id;
    const targetPlayer = matches[2];

    // If there already exists a game that you made against the same player (duplicate game)
    const duplicateGame = roshamboGames.find((game) => {
        return ((game.initiatingPlayer === currentPlayer) && (game.targetPlayer === targetPlayer));
    });
    if (duplicateGame) {
        return respond(request, h, `You have already challenged <@${targetPlayer}> to a match. (Hint: You played \`${duplicateGame.initialMove}\`)`, false);
    }

    const gameToRespondToIndex = roshamboGames.findIndex((game) => {
        return ((game.initiatingPlayer === targetPlayer) && (game.targetPlayer === currentPlayer));
    });
    if (gameToRespondToIndex >= 0) {
        const gameToRespondTo = JSON.parse(JSON.stringify(roshamboGames[gameToRespondToIndex]));
        // Remove the game
        roshamboGames.splice(gameToRespondToIndex, 1);
        switch(gameToRespondTo.initialMove) {
        case 'rock':
            if (move === 'rock') return respond(request, h, `Your rocks clash together, resulting in a tie between <@${gameToRespondTo.initiatingPlayer}> and <@${gameToRespondTo.targetPlayer}>!`, true);
            if (move === 'paper') return respond(request, h, `<@${gameToRespondTo.initiatingPlayer}>'s rock gets covered by <@${gameToRespondTo.targetPlayer}>'s paper, which somehow is a victory!`, true);
            if (move === 'scissors') return respond(request, h, `<@${gameToRespondTo.initiatingPlayer}>'s rock smashes <@${gameToRespondTo.targetPlayer}>'s scissors to smithereens!`, true);
        case 'paper':
            if (move === 'rock') return respond(request, h, `<@${gameToRespondTo.initiatingPlayer}>'s paper covers <@${gameToRespondTo.targetPlayer}>'s rock, which somehow is a victory!`, true);
            if (move === 'paper') return respond(request, h, `Your papers flutter in the wind, resulting in a tie between <@${gameToRespondTo.initiatingPlayer}> and <@${gameToRespondTo.targetPlayer}>!`, true);
            if (move === 'scissors') return respond(request, h, `<@${gameToRespondTo.initiatingPlayer}>'s paper is sliced into oragami by <@${gameToRespondTo.targetPlayer}>'s scissors!`, true);
        case 'scissors':
            if (move === 'rock') return respond(request, h, `<@${gameToRespondTo.initiatingPlayer}>'s scissors get smashed to smithereens by <@${gameToRespondTo.targetPlayer}>'s rock!`, true);
            if (move === 'paper') return respond(request, h, `<@${gameToRespondTo.initiatingPlayer}>'s scissors slice <@${gameToRespondTo.targetPlayer}> paper into oragami!`, true);
            if (move === 'scissors') return respond(request, h, `Your scissors clang together like swords in battle, resulting in a tie between <@${gameToRespondTo.initiatingPlayer}> and <@${gameToRespondTo.targetPlayer}>!`, true);
        }
    }

    // Else, no game exists, so let's make one!
    roshamboGames.push({
        initiatingPlayer: currentPlayer,
        targetPlayer: targetPlayer,
        initialMove: move
    });
    return respond(request, h, `<@${currentPlayer}> has challenged <@${targetPlayer}> to a roshambo match! Respond with \`/claybot roshambo [rock|paper|scissors] [@${request.payload.user_name}]\``, true);
}

async function help (request, h) {
    const url = request.payload.response_url;

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
