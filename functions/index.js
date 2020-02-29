const functions = require('firebase-functions');
const axios = require('axios');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.getIP = functions.https.onRequest(async (request, response) => {
	try {
		const myIP = await axios.get('https://icanhazip.com');
		response.send(myIP.data.trim());
	} catch (e) {
		console.error('Unhandled error in getIP', e);
		response.status(500).send();
	}
});
