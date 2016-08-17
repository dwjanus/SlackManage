
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
  //if (err) console.log(util.inspect(err));

  var attachments = incidents.slice(0, 5).map((incident) => {
    return {
      title: `${incident.title}\n`,
      color: '#0067B3',
      text: `${incident.description}`,
      fields: [
        {
          title: 'State',
          value: `${incident.state}`,
          short: true
        },
        {
          title: 'Priority',
          value: `${incident.priority}`,
          short: true
        }
      ]
      footer: `${incident.requester}\n`,
      ts: `${incident.ts}`,
      mrkdown_in: ['text', 'pretext']
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

