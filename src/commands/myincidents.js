
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');
const util = require('util');
const slack = require('slack');

let api = slack.api.client(config('SLACK_TOKEN'));

const msgDefaults = {
  response_type: 'in_channel',
  username: 'mine',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {
  
  var attachments = [];
  // get user slack id, then use that to retrieve email info
  var userid = payload.user_id;
  var options = {user: userid};

  var user = api.users.info(options, function (err, res) {
    if (err) console.log(err);

    var email = res.user.profile.email;
    console.log('\n' + JSON.stringify(email) + '\n');
    
    var incidents = Samanage.my_incidents(JSON.stringify(email));

    attachments = incidents.slice(0, 4).map((incident) => {
      return {
        title: `${incident.title}\n`,
        title_link: `${incident.title_link}`,
        pretext: `Ticket: ${incident.number} - Requested by: ${incident.requester}\n`,
        color: `${incident.color}`,
        text: `${incident.description}\n\n`,
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
        footer: 'due on: ',
        ts: `${incident.ts}`,
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

module.exports = { pattern: /mine/ig, handler: handler };
