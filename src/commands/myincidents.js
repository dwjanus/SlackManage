
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
  
  var userid = payload.user_id;
  var options = {user: userid};
  var attachments = [];
  var email = "";
  var ids = [];
  var size;
  var group_id; //= '1858000'; // this will be blank soon

  // get user slack id, then use that to retrieve email info
  var user = api.users.info(options, function (err, res) {
    if (err) console.log(err);

    email = res.user.profile.email;
    console.log('EMAIL: ' + email + '\n');

    // get the correct user from Samanage via their email
    var useroptions = {
      host: 'api.samanage.com',
      path: '/users.json?email=' + email,
      method: 'GET',
      headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
      auth: username + ':' + password
    };
    
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
        
        var first_group = parsed[0].group_ids[0];
        console.log('FIRST GROUP_ID: ' + first_group + ' ' + typeof first_group + '\n');
        
        ids = parsed[0].group_ids;
        console.log('GROUP_IDS: ' + ids + ' ' + typeof ids + '\n');

        // get the correct group_id from the Samanage user
        size = ids.length;
        console.log('SIZE OF GROUP ARRAY: ' + size + '\n');

        var group_options = {
          host: 'api.samanage.com',
          path: '/groups/' + ids[0] + '.json',
          method: 'GET',
          headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
          auth: username + ':' + password
        };

        var group_request = https.request(group_options, function (group_response) {
          var group_body = "";
          group_response.on('data', function (chunk) {
            group_body += chunk;
          });

          group_response.on('end', function () {
            var parsed_group = JSON.parse(group_body);
            console.log('PARSED: ' + JSON.stringify(parsed_group) + '\n');
            console.log('IS USER? ' + parsed_group[0].is_user + ' ' + typeof parsed_group.is_user  + '\n');
            if (parsed_group[0].is_user === true) {
              group_id = ids[0].toString();
              console.log('GROUP_ID FOUND: ' + group_id + '\n');
            }
          });
        });
        group_request.end();

        group_request.on('error', function (e) {
          console.log('problem with request: ' + e.message);
        });

      });
    });
    req.end();

    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });

    // if (size == 1) {
      // group_id = ids[0].toString();
    // } else {
      // var found = false;
      // var count = 0;
      // while((count < size) || (found === false)) {
      //   console.log('CURRENT ID: ' + ids[count] + '\n');
      //   group_path += (ids[count] + '.json');
      //   console.log('GROUP_PATH: ' + group_path + '\n');

      //   var group_request = https.get(group_path, function (group_response) {
      //     var group_body = "";
      //     group_response.on('data', function (chunk) {
      //       group_body += chunk;
      //     });

      //     group_response.on('end', function () {
      //       var parsed = JSON.parse(group_body);
      //       console.log('PARSED: ' + JSON.stringify(parsed) + '\n');
      //       if (parsed.is_user === true) {
      //         group_id = ids[count].toString();
      //         found = true;
      //         console.log('GROUP_ID FOUND: ' + group_id + '\n');
      //       }
      //     });
      //   });
      //   group_request.end();
      //   count++;
      // }
    // }
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
