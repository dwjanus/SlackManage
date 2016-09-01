
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
  API_PASS: 'BenHobgood666'
};

module.exports = (key) => {
  if (!key) return config;

  return config[key];
};