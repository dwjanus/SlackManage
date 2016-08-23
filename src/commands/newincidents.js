
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'new',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {

  Samanage.new_incidents((err, incidents) => {
    if (err) console.log(err);

    var attachments = incidents.slice(0, 5).map((incident) => {
      return {
        title: `${incident.title}\n`,
        title_link: `${incident.title_link}`,
        pretext: `Ticket: ${incident.number} - Requested by: ${incident.requester}\n`,
        color: `${incident.color}`,
        text: `${incident.description}\n\n`,
        fields: [
          // {
          //   title: 'Assigned To',
          //   value: `${incident.assignee}`,
          //   short: true
          // },
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
        ],
        footer: 'due on: ',
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
  });
};

module.exports = { pattern: /new/ig, handler: handler };

