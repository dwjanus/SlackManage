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
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  ICON_EMOJI: ':samanage:'
};

module.exports = (key) => {
  if (!key) return config;

  return config[key];
};