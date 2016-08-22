
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');
const util = require('util');
const slack = require('slack');
const https = require('https');

const username = 'devin.janus@samanage.com';
const password = 'BenHobgood666';

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

  var email = "";
  var user = api.users.info(options, function (err, res) {
    if (err) console.log(err);

    email = res.user.profile.email;
    console.log('EMAIL: ' + email + '\n');
  });

  console.log('EMAIL: ' + email + ' ' + typeof email + '\n');

  // get the correct group_id from samanage
  var useroptions = {
    host: 'api.samanage.com',
    path: '/users.json?email=' + email,
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
    auth: username + ':' + password
  };
  
  var group_id; //= '1858000'; // this will be blank soon
  var ids = [];
  var size;

  var req = https.request(useroptions, function (res) {
    console.log('STATUS: ' + res.statusCode);
    res.setEncoding('utf8');

    var body = "";
    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function () {
      var parsed = JSON.parse(body);
      console.log('BODY: ' + JSON.stringify(parsed) + '\n');
      var ids = parsed[0].group_ids;
      console.log('GROUP_IDS: ' + ids + ' ' + typeof ids + '\n');

      var group_path = 'https://api.samanage.com/groups/';
      var found = false;
      var count = 0;
      size = ids.length;
      console.log('SIZE OF GROUP ARRAY: ' + size + '\n');

      if (size == 1) {
        group_id = ids[0].toString();
      } else {
        while((count < size) || (found === false)) {
          console.log('CURRENT ID: ' + ids[count] + '\n');
          group_path += (ids[count] + '.json');
          var group_request = https.get(group_path, function (group_response) {
            var group_body = "";
            group_response.on('data', function (chunk) {
              group_body += chunk;
            });

            group_response.on('end', function () {
              var parsed = JSON.parse(group_body);
              console.log('PARSED: ' + JSON.stringify(parsed) + '\n');
              if (parsed.is_user === true) {
                group_id = ids[count].toString();
                found = true;
                console.log('GROUP_ID FOUND: ' + group_id + '\n');
              }
            });
          });
          group_request.end();
          count++;
        }
      }
    });
  });
  req.end();

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  var incidents = Samanage.my_incidents(group_id, size);

  attachments = incidents.slice(0, size).map((incident) => {
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

  let msg = _.defaults({
    channel: payload.channel_name,
    attachments: attachments
  }, msgDefaults);
  
  res.set('content-type', 'application/json');
  res.status(200).json(msg);
  return;
};

module.exports = { pattern: /mine/ig, handler: handler };
