const { App } = require('@slack/bolt');
const functions = require('firebase-functions');

const app = new App({
	signingSecret: functions.config().slackslash.slack_signing_secret,
	token: functions.config().slackslash.slack_verification_token,
});

/* Add functionality here */

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();

app.command('cat-fact', async ({say, respond, ack}) => {
	await ack();
	await respond('Testing a cat fact. This is not a real cat fact.');
});

exports.slackslash = functions.https.onRequest(app);
