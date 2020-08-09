const axios = require('axios');

const catFact = async ({command, ack, respond}) => {
	await ack();

	try {
		const catFactResponse = await axios({
			method: 'GET',
			url: 'https://cat-fact.herokuapp.com/facts/random',
		});

		const factText = catFactResponse.data.text;
		await respond(`<@${command.user_id}>'s cat fact:\n${factText}`)
	} catch (e) {
		console.error('Error to getting cat fact', e);
		await respond({
			response_type: 'ephemeral',
			text: 'Failed to retrieve cat fact from cat-fact.herokuapp.com. Perhaps the app is down?',
		});
	}
}

module.exports = catFact;
