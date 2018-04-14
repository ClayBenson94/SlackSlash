'use strict';

const axios = require('axios');
const { Client } = require('pg');

const postgres = new Client();
postgres.connect();

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
 * Responds to the slack `response_url` with the given text. Optionally can respond in channel or ephemerally
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 * @param {*} text The text to respond with
 * @param {*} respondInChannel Whether or not to respond in channel (or ephemeral)
 */
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

/**
 * Handles roshambo commands. Will handle the creation of games and the response to games
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 * @param {*} commandText The text of the command without the command name
 */
async function roshambo (request, h, commandText) {
    const roshamboRegex = /<@(\w+)?\|?(\w+)?>\s(rock|paper|scissors)/igm;
    if (!roshamboRegex.test(commandText)) {
        return respond(request, h, 'Roshambo must initiated with `/claybot roshambo @username [rock|paper|scissors]`', false);
    }

    roshamboRegex.lastIndex = 0; // reset regex due to /g flag
    const matches = roshamboRegex.exec(commandText);

    const move = matches[3].toLowerCase();
    const currentPlayer = request.payload.user_id;
    const targetPlayer = matches[1];

    // If you try and challenge yourself
    if (currentPlayer === targetPlayer) {
        return respond(request, h, 'You cannot challenge yourself, fool! Get back to work!', false);
    }

    // If there already exists a game that you made against the same player (duplicate game)
    let duplicateGameResponse = await postgres.query('SELECT * FROM roshambo_games WHERE initiating_player = $1 AND target_player = $2;', [currentPlayer, targetPlayer]);
    if (duplicateGameResponse.rows.length > 0) {
        const duplicateGame = duplicateGameResponse.rows[0]
        return respond(request, h, `You have already challenged <@${targetPlayer}> to a match. (Hint: You played \`${duplicateGame.initial_move}\`)`, false);
    }

    let gameToRespondToResponse = await postgres.query('SELECT * FROM roshambo_games WHERE initiating_player = $1 AND target_player = $2;', [targetPlayer, currentPlayer]);
    if (gameToRespondToResponse.rows.length > 0) {
        const gameToRespondTo = gameToRespondToResponse.rows[0];
        // Remove the game
        await postgres.query('DELETE FROM roshambo_games WHERE initiating_player = $1 AND target_player = $2;', [targetPlayer, currentPlayer]);
        switch (gameToRespondTo.initial_move) {
        case 'rock':
            if (move === 'rock') return respond(request, h, `Your rocks clash together, resulting in a tie between <@${gameToRespondTo.initiating_player}> and <@${gameToRespondTo.target_player}>!`, true);
            if (move === 'paper') return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s rock gets covered by <@${gameToRespondTo.target_player}>'s paper, which somehow is a victory!`, true);
            if (move === 'scissors') return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s rock smashes <@${gameToRespondTo.target_player}>'s scissors to smithereens!`, true);
            break;
        case 'paper':
            if (move === 'rock') return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s paper covers <@${gameToRespondTo.target_player}>'s rock, which somehow is a victory!`, true);
            if (move === 'paper') return respond(request, h, `Your papers flutter in the wind, resulting in a tie between <@${gameToRespondTo.initiating_player}> and <@${gameToRespondTo.target_player}>!`, true);
            if (move === 'scissors') return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s paper is sliced into oragami by <@${gameToRespondTo.target_player}>'s scissors!`, true);
            break;
        case 'scissors':
            if (move === 'rock') return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s scissors get smashed to smithereens by <@${gameToRespondTo.target_player}>'s rock!`, true);
            if (move === 'paper') return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s scissors slice <@${gameToRespondTo.target_player}> paper into oragami!`, true);
            if (move === 'scissors') return respond(request, h, `Your scissors clang together like swords in battle, resulting in a tie between <@${gameToRespondTo.initiating_player}> and <@${gameToRespondTo.target_player}>!`, true);
            break;
        }
    }

    // Else, no game exists, so let's make one!
    await postgres.query('INSERT INTO roshambo_games(initiating_player, target_player, initial_move) VALUES($1, $2, $3) RETURNING *;', [currentPlayer, targetPlayer, move]);
    return respond(request, h, `<@${currentPlayer}> has challenged <@${targetPlayer}> to a roshambo match! Respond with \`/claybot roshambo @${request.payload.user_name} [rock|paper|scissors]\``, true);
}

/**
 * Prints a usage message to the user listing out various commands
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 */
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
                                title: 'scrabble _text_',
                                value: 'Turns _text_ into scrabble letters\n_Example:_ `/claybot scrabble Hey man`',
                                short: false
                            },
                            {
                                title: 'roshambo _@username_ _[rock|paper|scissors]_',
                                value: 'Challenges _@username_ to a game of Rock, Paper, Scissors\n_Example:_ `/claybot roshambo @cbenson paper`',
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
