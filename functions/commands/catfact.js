const slackRespond = require('../utilities').slackRespond;
const axios = require('axios');

const catFact = async (req, res) => {
	let catFactResponse;
	try {
		catFactResponse = await axios({
			method: 'GET',
			url: 'https://cat-fact.herokuapp.com/facts/random'
		});
	} catch (e) {
		console.error('Error calling to get cat fact', e);
		await slackRespond({
			responseURL: req.body.response_url,
			text: `Failed to retrieve cat fact from cat-fact.herokuapp.com. Perhaps the app is down?`,
			respondInChannel: false
		});
		return res.status(200).end();
	}
	const factText = catFactResponse.data.text;
	await slackRespond({
		responseURL: req.body.response_url,
		text: `<@${req.body.user_id}>'s cat fact:\n${factText}`,
		respondInChannel: true
	});
	return res.status(200).end();
}

module.exports = catFact;
