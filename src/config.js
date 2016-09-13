
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
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  OAUTH_TOKEN: process.env.OAUTH_TOKEN,
  samanage_options: {
    host: 'api.samanage.com',
    path: '',
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json', 'Cache-Control' : 'no-store' },
    auth: process.env.API_USER + ':' + process.env.API_PASS
  }
};

module.exports = (key) => {
  if (!key) return config;

  return config[key];
};