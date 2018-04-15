const axios = require('axios');

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
                        footer: 'Claybot'
                    }
                ]
            }
        });
    } catch (e) {
        return h.response().code(500);
    }
    return h.response().code(200);
}

module.exports = help;
