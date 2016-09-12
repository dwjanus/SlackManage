
'use strict';

const dotenv = require('dotenv');
const ENV = process.env.NODE_ENV || 'development';

if (ENV === 'development') dotenv.load();

const config = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  PROXY_URI: process.env.PROXY_URI,
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  SAMANAGE_COMMAND_TOKEN: process.env.SAMANAGE_COMMAND_TOKEN,
  SLACK_TOKEN: process.env.SLACK_TOKEN,
  ICON_EMOJI: ':samanage:',
  API_USER: 'devin.janus@samanage.com',
  API_PASS: 'BenHobgood666',
  CLIENT_ID: '64177576980.78861190246',
  CLIENT_SECRET: 'b6b4366f0d5390c7ec62355393147cd9',
  OAUTH_TOKEN: 'nOlY6PpCYaVbfPEj9U4JEFSd'
};

module.exports = (key) => {
  if (!key) return config;

  return config[key];
};