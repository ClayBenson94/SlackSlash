const { App, ExpressReceiver } = require('@slack/bolt');
const functions = require('firebase-functions');

// Using an ExpressReceiver since Firebase Functions expect an express app in the export.
const expressReceiver = new ExpressReceiver({
	signingSecret: functions.config().slackslash.slack_signing_secret,
	endpoints: '/events',
})

// Set up BoltJS app
const app = new App({
	receiver: expressReceiver,
	token: functions.config().slackslash.slack_bot_token,
});

// Global error handler
app.error(console.log);

/* Add functionality here */
app.command('/catfact', async ({command, ack, respond}) => {
	console.log('WE IN THE CAT FACT');
	await ack();
	await respond(`You said "${command.text}"`);
});

exports.slackslash = functions.https.onRequest(expressReceiver.app);
