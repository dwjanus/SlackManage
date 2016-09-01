
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');
const https = require('https');
const util = require('util');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'incident',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {

  var str = payload.text;
  var cmd = str.split(/(@|#)/)[1];
  var number = str.split(/(@|#)/)[2];
  console.log('STR: ' + str + '\nCMD: ' + cmd + '\nNUMBER: ' + number + '\n');

  var options = {
    host: 'api.samanage.com',
    path: '/incidents.json?number=' + number,
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
    auth: username + ':' + password
  };

  if (cmd === '@')
    options.path = '/incidents/' + number + '.json';

  Samanage.incident(options, (err, incident) => {
    if (err) console.log(err);

    var attachments = [
      {
        title: `${incident.title}\n`,
        title_link: `${incident.title_link}`,
        pretext: `Ticket: ${incident.number} - Requested by: ${incident.requester}\n`,
        color: `${incident.color}`,
        text: `${incident.description}\n\n`,
        fields: [
          {
            title: 'Assigned To',
            value: `${incident.assignee}`,
            short: true
          },
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
    ];  

    let msg = _.defaults({
      channel: payload.channel_name,
      attachments: attachments
    }, msgDefaults);

    res.set('content-type', 'application/json');
    res.status(200).json(msg);
    return;
  });
};

module.exports = { pattern: /(@|#)+[0-9]/ig, handler: handler };
