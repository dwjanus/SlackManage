
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');
const https = require('https');
const util = require('util');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'mine',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {
  
  let pre = _.defaults({
    channel: payload.channel_name,
    text: 'Pulling Comments...'
  }, msgDefaults);

  res.set('Content-Type', 'application/json');
  res.send(pre);

  return;
};
