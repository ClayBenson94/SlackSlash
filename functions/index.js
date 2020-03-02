const functions = require('firebase-functions');
const express = require('express');

// Express app configuration
const app = express();
// Validate all requests through a middlware that checks the validation token
app.use((req, res, next) => {
	if (!req.body) {
		return res.status(400).json({ msg: 'No slack payload was provided' });
	}

	if (req.body.token !== functions.config().slackslash.slack_verification_token) {
		return res.status(401).json({ msg: 'Invalid slack verification token' });
	}

	return next();
});

app.use('/cat-fact', require('./commands/catfact'));
app.use('/help', require('./commands/help'));

exports.slackslash = functions.https.onRequest(app);
