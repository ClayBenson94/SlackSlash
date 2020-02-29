const functions = require('firebase-functions');
const axios = require('axios');
const express = require('express');

const app = express();

async function respond ({responseURL, text, respondInChannel}) {
	await axios({
		method: 'post',
		url: responseURL,
		data: {
			response_type: respondInChannel ? 'in_channel' : 'ephemeral',
			text: text
		}
	});
}

app.use((req, res, next) => {
	if (!req.body) {
		return res.status(400).json({ msg: 'No slack payload was provided' });
	}

	if (req.body.token !== functions.config().slackslash.slack_verification_token) {
		return res.status(401).json({ msg: 'Invalid slack verification token' });
	}

	return next();
});

app.use('/catfact', async (req, res) => {
	let catFactResponse;
	try {
		catFactResponse = await axios({
			method: 'GET',
			url: 'https://cat-fact.herokuapp.com/facts/random'
		});
	} catch (e) {
		console.error('Error calling to get cat fact', e);
		await respond({
			responseURL: req.body.response_url,
			text: `Failed to retrieve cat fact from cat-fact.herokuapp.com. Perhaps the app is down?`,
			respondInChannel: false
		});
		return res.status(200).end();
	}
	const factText = catFactResponse.data.text;
	await respond({
		responseURL: req.body.response_url,
		text: `<@${req.body.user_id}>'s cat fact:\n${factText}`,
		respondInChannel: true
	});
	return res.status(200).end();
});

exports.main = functions.https.onRequest(app);
