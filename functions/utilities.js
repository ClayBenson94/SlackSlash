const axios = require('axios');

async function slackRespond ({responseURL, text, respondInChannel}) {
	await axios({
		method: 'post',
		url: responseURL,
		data: {
			response_type: respondInChannel ? 'in_channel' : 'ephemeral',
			text: text
		}
	});
}

module.exports = {
	slackRespond,
}