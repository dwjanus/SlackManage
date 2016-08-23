
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');
const util = require('util');
const slack = require('slack');
const https = require('https');

const username = 'devin.janus@samanage.com';
const password = 'BenHobgood666';

const msgDefaults = {
  response_type: 'in_channel',
  username: 'mine',
  icon_emoji: config('ICON_EMOJI')
};

var api = slack.api.client(config('SLACK_TOKEN'));

const handler = (payload, res) => {
  
  var userid = payload.user_id;
  var options = {user: userid};
  var attachments = [];
  var email = "";
  var ids = [];
  var size;
  var group_id; //= '1858000'; // this will be blank soon

  // get user slack id, then use that to retrieve email info
  var user = api.users.info(options, function (err, respo) {
    if (err) console.log(err);

    email = respo.user.profile.email;
    console.log('EMAIL: ' + email + '\n');

    // get the correct user from Samanage via their email
    var useroptions = {
      host: 'api.samanage.com',
      path: '/users.json?email=' + email,
      method: 'GET',
      headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
      auth: username + ':' + password
    };
    
    var request = https.request(useroptions, function (response) {
      console.log('STATUS: ' + response.statusCode);
      response.setEncoding('utf8');

      var body = "";
      response.on('data', function (chunk) {
        body += chunk;
      });

      response.on('end', function () {
        var parsed = JSON.parse(body);
        
        ids = parsed[0].group_ids;
        console.log('GROUP_IDS: ' + ids + '\n');

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
          group_response.setEncoding('utf8');

          var group_body = "";
          group_response.on('data', function (chunk) {
            group_body += chunk;
          });

          group_response.on('end', function () {
            var parsed_group = JSON.parse(group_body);
            group_id = ids[0].toString();
            
            if (size > 1) {
              var found = false;
              var count = 0;
              while((count < size) || (found === false)) {
                group_id = ids[count].toString();

                var group_id_options = {
                  host: 'api.samanage.com',
                  path: '/groups/' + group_id + '.json',
                  method: 'GET',
                  headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
                  auth: username + ':' + password
                };

                var group_id_request = https.get(group_id_options, function (group_id_response) {
                  var group_id_body = "";
                  group_id_response.on('data', function (chunk) {
                    group_id_body += chunk;
                  });

                  group_id_response.on('end', function () {
                    var parsed = JSON.parse(group_body);
                    console.log('PARSED: ' + JSON.stringify(parsed) + '\n');
                    if (parsed.is_user) {
                      found = true;
                      console.log('GROUP_ID FOUND: ' + group_id + '\n');
                    }
                  });
                });
                group_id_request.end();
                count++;
              }
            }

            Samanage.my_incidents(group_id, size, (err, my_incidents_list) => {
              if (err) console.log(err);

              console.log('\nMY_INCIDENTS: ' + JSON.stringify(my_incidents_list) + '\n');
              attachments = my_incidents_list.slice(0, size).map((incident) => {
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
              return
            });
            
          });
        });
        group_request.end();

        group_request.on('error', function (e) {
          console.log('problem with request: ' + e.message);
        });

      });
    });
    request.end();

    request.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    }); 

  });
};

module.exports = { pattern: /mine/ig, handler: handler };


 

