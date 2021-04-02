const axios = require('axios');

const dogFact = async ({command, ack, respond}) => {
	ack();

	try {
		const dogFactResponse = await axios({
			method: 'GET',
			url: 'https://dog-api.kinduff.com/api/facts',
		});

		const factText = dogFactResponse.data.facts[0];
		await respond({
			response_type: 'in_channel',
			text: `<@${command.user_id}>'s dog fact:\n${factText}`
		})
	} catch (e) {
		console.error('Error to getting dog fact', e);
		await respond({
			response_type: 'ephemeral',
			text: 'Failed to retrieve dog fact from dog-api.kinduff.com. Perhaps the app is down?',
		});
	}
}

module.exports = dogFact;
