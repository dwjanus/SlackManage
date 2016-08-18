
'use strict';

const _ = require('lodash');
const config = require('../config');
const slack = require('slack');
const Samanage = require('../lib/samanage');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Samanage.my_incidents',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {

  // pull userid from payload
  var userid = payload.user_id;
  console.log('\n' + JSON.stringify(userid) + '\n');
  // get the user profile here:
  var user = slack.users.profile.get(userid);
  // get the user's email here:
  var email = user.profile.email;
  console.log('\n' + JSON.stringify(email) + '\n');
  
  // var incidents = Samanage.my_incidents();

  // var attachments = incidents.slice(0, 5).map((incident) => {
  //   return {
  //     title: `${incident.title}\n`,
  //     title_link: `${incident.title_link}`,
  //     pretext: `Ticket: ${incident.number} - Requested by: ${incident.requester}\n`,
  //     color: `${incident.color}`,
  //     text: `${incident.description}\n\n`,
  //     fields: [
  //       {
  //         title: 'State',
  //         value: `${incident.state}`,
  //         short: true
  //       },
  //       {
  //         title: 'Priority',
  //         value: `${incident.priority}`,
  //         short: true
  //       }
  //     ],
  //     footer: 'due on: ',
  //     ts: `${incident.ts}`,
  //     mrkdown_in: ['text', 'pretext']
  //   }
  // });
    
  // let msg = _.defaults({
  //   channel: payload.channel_name,
  //   attachments: attachments
  // }, msgDefaults);

  res.set('content-type', 'application/json');
  res.status(200).json(msg);
  return;
};

module.exports = { pattern: /my incidents/ig, handler: handler };
