
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
    var color = '';
    if (incident.state) == "In Progress") {
      color = '#FFC8D2';
    } else if (incident.state) == "Resolved") {
      color = '#A7FFA1';
    } else if (incident.state) == "Assigned") {
      color = '#DEF9EB';
    } else if (incident.state) == "Closed") {
      color = '#AAAAAA';
    } else {
      color = '#0067B3';
    };
    return {
      title: `${incident.title}\n`,
      title_link: `${incident.title_link}\n`,
      author: `${incident.requester} / ${incident.requester_email}\n`,
      color: `${color}`,
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
      ],
      footer: `${incident.assignee}`,
      ts: `${incident.ts}`,
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

