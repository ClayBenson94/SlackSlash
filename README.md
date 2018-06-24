# SlackSlash
This is a simple Hapi (HTTP) server that responds to requests made by Slack.

## Installation

After cloning, run `npm install` and ensure that you have a file titled `.env` in the project's root. It should follow the format / variable names as listed in [defualt.env](./default.env).

When you set up an application in slack, you should be presented with a **Verification Token** under **Basic Information** for your application. This is what should be used for the `VERIFICATION_TOKEN` variable in .env.

This project also assumes a postgres database exists with the correct table information layed out. This is still a work in progress. [More information](https://github.com/ClayBenson94/SlackSlash/issues/1)

## Configuring in slack
This will also require that you hook up your application in slack to point to wherever this server is running. Slash commands and message actions should be configured to have the same names as in [commandHandler.js](./src/commands/commandHandler.js) and [actionHandler.js](./src/actions/actionHandler.js)