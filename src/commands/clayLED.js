const respond = require('../utilities/responseUtilities').respond;
const axios = require('axios');
const toHex = require('colornames');

function hexToR (h) {
	return parseInt(cutHex(h).substring(0, 2), 16);
}
function hexToG (h) {
	return parseInt(cutHex(h).substring(2, 4), 16);
}
function hexToB (h) {
	return parseInt(cutHex(h).substring(4, 6), 16);
}
function cutHex (h) {
	return h.charAt(0) === '#' ? h.substring(1, 7) : h;
}
function hexToRGB (hex) {
	return {
		r: hexToR(hex),
		g: hexToG(hex),
		b: hexToB(hex)
	};
}

/**
 * Change the lights according to claybenson.me's LED API
 * @param {*} payload The slack payload object
 * @param {*} h The hapi response toolkit
 */
async function clayLED (payload, h) {
	const inputColor = payload.text.trim();
	const hex = toHex(inputColor);

	if (!hex) {
		return respond(payload, h, `${inputColor} is not a valid color!`, false);
	}

	const rgb = hexToRGB(hex);

	try {
		await axios.get(`http://home.claybenson.me:8333/color?red=${rgb.r}&green=${rgb.g}&blue=${rgb.b}`);
	} catch (e) {
		console.error('Error setting color in clayLED', e);
		return respond(payload, h, `Error setting color... something went wrong!`, false);
	}

	return respond(payload, h, `Successfully set color to ${inputColor}`, false);
}

module.exports = clayLED;
