'use strict';

const help = require('./help');
const scrabble = require('./scrabble');
const catfact = require('./catfact');

/**
 * Maps the incoming command to the appropriate handler function
 * @param {*} request The hapi request object
 * @param {*} h The hapi response toolkit
 */
async function handleCommand (request, h) {
	const payload = request.payload;

	if (!payload || Object.keys(payload).length === 0) {
		return h.response({
			error: 'Empty payload received'
		}).code(400);
	}
	if (payload.token !== process.env.VERIFICATION_TOKEN) {
		return h.response({
			error: 'Invalid token'
		}).code(401);
	}

	try {
		switch (payload.command) {
		case process.env.HELP_COMMAND:
			return help(payload, h);
		case '/scrabble':
			return scrabble(payload, h);
		case '/catfact':
			return catfact(payload, h);
		default:
			return help(payload, h);
		}
	} catch (error) {
		console.error('Error occured in commandHandler.js');
		console.error(error);
		return h.response().code(500);
	}
}

module.exports = {
	handleCommand
};
