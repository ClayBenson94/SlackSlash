const slackRespond = require('../utilities').slackRespond;

async function help (req, res) {
	await slackRespond({
		responseURL: req.body.response_url,
		text: 'To see more about the commands I support, click my picture in the chat (to the left) and click "About this app"!',
		respondInChannel: false
	});
	return res.status(200).end();
}

module.exports = help;
