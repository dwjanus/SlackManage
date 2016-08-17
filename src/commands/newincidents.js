
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');
const util = require('util');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Samanage',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {
  var incidents = Samanage.new_incidents();
  // if (err) throw err;
  if (err) console.log(util.inspect(err));

  var attachments = incidents.slice(0, 4).map((incident) => {
    return {
      title: `${incident.title}`,
      color: '#0067B3',
      text: `${incident.requester}\n`,
      mrkdown_in: ['text']
    }
  });    

  let msg = _.defaults({
    channel: payload.channel_name,
    attachments: attachments
  }, msgDefaults);

  res.set('content-type', 'application/json');
  res.status(200).json(msg);
  return;
};

module.exports = { pattern: /incidents/ig, handler: handler };

