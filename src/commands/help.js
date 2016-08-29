
'use strict';

const _ = require('lodash');
const config = require('../config');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Samanage',
  icon_emoji: config('ICON_EMOJI')
};

let attachments = [
  {
    title: 'Samanagebot will help you view the status of, and modify, your latest incidents',
    color: '#0067B3',
    text: '[/samanage incidents] returns the 5 newest incidents \n' +
          '[/samanage my incidents] returns your 5 most recent incidents',
    mrkdown_in: ['text']
  },
  {
    title: 'Configuring Samanagebot',
    color: '#E3E4E6',
    text: '"/samanage help" ... youre\'re lookin at it! \n',
    mrkdown_in: ['text']
  }
];

const handler = (payload, res) => {
  let msg = _.defaults({
    channel: payload.channel_name,
    attachments: attachments
  }, msgDefaults);

  res.writeHead(200);
  res.end(msg);
  return;
};

module.exports = { pattern: /help/ig, handler: handler };