
'use strict';

const _ = require('lodash');
const config = require('../config');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Samanage',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {
  var attachments = [{
      title: 'Incidents',
      color: '#0067B3',
      text: 'This will contain a list with your 5 most recent incidents',
      mrkdown_in: ['text']
  }];

  let msg = _.defaults({
    channel: payload.channel_name,
    attachments: attachments
  }, msgDefaults);

  res.set('content-type', 'application/json');
  res.status(200).json(msg);
  res.write("BIT OL BUTTS");
  return;
};

module.exports = { pattern: /my incidents/ig, handler: handler };
