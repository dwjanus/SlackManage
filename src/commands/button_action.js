
'use strict';

const https = require('https');
const config = require('./config');
const util = require('util');
var Samanage = require('../lib/samanage');

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
};
