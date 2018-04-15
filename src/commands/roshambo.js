const { Client } = require('pg');
const respond = require('./commandUtilities').respond;

const postgres = new Client();
postgres.connect();

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
        const duplicateGame = duplicateGameResponse.rows[0];
        return respond(request, h, `You have already challenged <@${targetPlayer}> to a match. (Hint: You played \`${duplicateGame.initial_move}\`)`, false);
    }

    let gameToRespondToResponse = await postgres.query('SELECT * FROM roshambo_games WHERE initiating_player = $1 AND target_player = $2;', [targetPlayer, currentPlayer]);
    if (gameToRespondToResponse.rows.length > 0) {
        const gameToRespondTo = gameToRespondToResponse.rows[0];
        // Remove the game from roshambo_games
        await postgres.query('DELETE FROM roshambo_games WHERE initiating_player = $1 AND target_player = $2;', [targetPlayer, currentPlayer]);

        // Add the appropriate stats rows if necessary
        const currentPlayerStatsResponse = await postgres.query('SELECT FROM roshambo_stats WHERE player = $1;', [currentPlayer]);
        if (currentPlayerStatsResponse.rows.length === 0) {
            await postgres.query('INSERT INTO roshambo_stats(player) VALUES($1) RETURNING *;', [currentPlayer]);
        }
        const targetPlayerStatsResponse = await postgres.query('SELECT FROM roshambo_stats WHERE player = $1;', [targetPlayer]);
        if (targetPlayerStatsResponse.rows.length === 0) {
            await postgres.query('INSERT INTO roshambo_stats(player) VALUES($1) RETURNING *;', [targetPlayer]);
        }

        switch (gameToRespondTo.initial_move) {
        case 'rock':
            await postgres.query('UPDATE roshambo_stats SET num_rocks_played = num_rocks_played + 1 WHERE player = $1;', [gameToRespondTo.initiating_player]);
            if (move === 'rock') {
                await postgres.query('UPDATE roshambo_stats SET ties = ties + 1 WHERE player = $1 OR player = $2;', [gameToRespondTo.initiating_player, gameToRespondTo.target_player]);
                await postgres.query('UPDATE roshambo_stats SET num_rocks_played = num_rocks_played + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                return respond(request, h, `Your rocks clash together, resulting in a tie between <@${gameToRespondTo.initiating_player}> and <@${gameToRespondTo.target_player}>!`, true);
            }
            if (move === 'paper') {
                await postgres.query('UPDATE roshambo_stats SET wins = wins + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                await postgres.query('UPDATE roshambo_stats SET losses = losses + 1 WHERE player = $1;', [gameToRespondTo.initiating_player]);
                await postgres.query('UPDATE roshambo_stats SET num_papers_played = num_papers_played + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s rock gets covered by <@${gameToRespondTo.target_player}>'s paper, which somehow is a victory!`, true);
            }
            if (move === 'scissors') {
                await postgres.query('UPDATE roshambo_stats SET wins = wins + 1 WHERE player = $1;', [gameToRespondTo.initiating_player]);
                await postgres.query('UPDATE roshambo_stats SET losses = losses + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                await postgres.query('UPDATE roshambo_stats SET num_scissors_played = num_scissors_played + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s rock smashes <@${gameToRespondTo.target_player}>'s scissors to smithereens!`, true);
            }
            break;
        case 'paper':
            await postgres.query('UPDATE roshambo_stats SET num_papers_played = num_papers_played + 1 WHERE player = $1;', [gameToRespondTo.initiating_player]);
            if (move === 'rock') {
                await postgres.query('UPDATE roshambo_stats SET wins = wins + 1 WHERE player = $1;', [gameToRespondTo.initiating_player]);
                await postgres.query('UPDATE roshambo_stats SET losses = losses + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                await postgres.query('UPDATE roshambo_stats SET num_rocks_played = num_rocks_played + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s paper covers <@${gameToRespondTo.target_player}>'s rock, which somehow is a victory!`, true);
            }
            if (move === 'paper') {
                await postgres.query('UPDATE roshambo_stats SET ties = ties + 1 WHERE player = $1 OR player = $2;', [gameToRespondTo.initiating_player, gameToRespondTo.target_player]);
                await postgres.query('UPDATE roshambo_stats SET num_papers_played = num_papers_played + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                return respond(request, h, `Your papers flutter in the wind, resulting in a tie between <@${gameToRespondTo.initiating_player}> and <@${gameToRespondTo.target_player}>!`, true);
            }
            if (move === 'scissors') {
                await postgres.query('UPDATE roshambo_stats SET wins = wins + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                await postgres.query('UPDATE roshambo_stats SET losses = losses + 1 WHERE player = $1;', [gameToRespondTo.initiating_player]);
                await postgres.query('UPDATE roshambo_stats SET num_scissors_played = num_scissors_played + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s paper is sliced into oragami by <@${gameToRespondTo.target_player}>'s scissors!`, true);
            }
            break;
        case 'scissors':
            await postgres.query('UPDATE roshambo_stats SET num_scissors_played = num_scissors_played + 1 WHERE player = $1;', [gameToRespondTo.initiating_player]);
            if (move === 'rock') {
                await postgres.query('UPDATE roshambo_stats SET wins = wins + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                await postgres.query('UPDATE roshambo_stats SET losses = losses + 1 WHERE player = $1;', [gameToRespondTo.initiating_player]);
                await postgres.query('UPDATE roshambo_stats SET num_rocks_played = num_rocks_played + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s scissors get smashed to smithereens by <@${gameToRespondTo.target_player}>'s rock!`, true);
            }
            if (move === 'paper') {
                await postgres.query('UPDATE roshambo_stats SET wins = wins + 1 WHERE player = $1;', [gameToRespondTo.initiating_player]);
                await postgres.query('UPDATE roshambo_stats SET losses = losses + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                await postgres.query('UPDATE roshambo_stats SET num_papers_played = num_papers_played + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                return respond(request, h, `<@${gameToRespondTo.initiating_player}>'s scissors slice <@${gameToRespondTo.target_player}> paper into oragami!`, true);
            }
            if (move === 'scissors') {
                await postgres.query('UPDATE roshambo_stats SET ties = ties + 1 WHERE player = $1 OR player = $2;', [gameToRespondTo.initiating_player, gameToRespondTo.target_player]);
                await postgres.query('UPDATE roshambo_stats SET num_scissors_played = num_scissors_played + 1 WHERE player = $1;', [gameToRespondTo.target_player]);
                return respond(request, h, `Your scissors clang together like swords in battle, resulting in a tie between <@${gameToRespondTo.initiating_player}> and <@${gameToRespondTo.target_player}>!`, true);
            }
            break;
        }
    }

    // Else, no game exists, so let's make one!
    await postgres.query('INSERT INTO roshambo_games(initiating_player, target_player, initial_move) VALUES($1, $2, $3) RETURNING *;', [currentPlayer, targetPlayer, move]);
    return respond(request, h, `<@${currentPlayer}> has challenged <@${targetPlayer}> to a roshambo match! Respond with \`/claybot roshambo @${request.payload.user_name} [rock|paper|scissors]\``, true);
}

module.exports = roshambo;
