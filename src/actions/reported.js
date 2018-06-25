const respond = require('./../utilities/responseUtilities').respond;

/**
 * Handles 'reported' commands.
 * @param {*} payload The slack payload object
 * @param {*} h The hapi response toolkit
 */
async function reported (payload, h) {
    const WebClient = require('@slack/client').WebClient;
    const slackWeb = new WebClient(process.env.SLACK_TOKEN);

    if (payload.channel.name === 'directmessage') {
        return respond(payload, h, 'You cannot report messages in a direct message', false);
    }

    if (payload.message.user) {
        let reactions = await slackWeb.reactions.get({ channel: payload.channel.id, timestamp: payload.message.ts, full: true });
        let alreadyReacted = reactions.message.reactions && reactions.message.reactions.some((reaction) => {
            return reaction.users.some((reactionUser) => {
                return reactionUser === process.env.BOT_ID;
            });
        });
        if (!alreadyReacted) {
            await slackWeb.reactions.add({ name: 'rotating_light', channel: payload.channel.id, timestamp: payload.message.ts });
            await slackWeb.chat.postMessage({ text: '🚨WEE WOO WEE WOO🚨\n👮🚓You have been reported! Put your hands behind your back!🚓👮‍♀️', channel: payload.channel.id, thread_ts: payload.message.ts });
        } else {
            slackWeb.chat.postEphemeral({ text: 'This message has already been reported!', channel: payload.channel.id, user: payload.user.id }).catch(console.error);
        }
    } else if (payload.message.bot_id) {
        slackWeb.chat.postEphemeral({ text: 'Bots cannot be reported! Bots are the law!', channel: payload.channel.id, user: payload.user.id }).catch(console.error);
    }
    return h.response().code(200);
}

module.exports = reported;
