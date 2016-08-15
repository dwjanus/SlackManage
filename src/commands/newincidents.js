
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Samanage',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {
  Samanage.new_incidents((err, incidents) => {
    if (err) throw err;

    var attachments = incidents.slice(0, 4).map((incident) => {
      return {
        title: `${incident.name}/${incident.requester}`,
        color: '#0067B3',
        text: `${incident.assignee}\n_${incident.description}_\n`,
        mrkdown_in: ['text', 'pretext']
      }
    });    
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

