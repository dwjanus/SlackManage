
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');
const util = require('util');
const slack = require('slack');
const https = require('https');

const username = 'devin.janus@samanage.com';
const password = 'BenHobgood666';

var api = slack.api.client(config('SLACK_TOKEN'));

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

  // try wrapping this whole thing in a post request to request_url?

  // get user slack id, then use that to retrieve email info
  var user = api.users.info(options, function (err, respo) {
    if (err) console.log(err);

    email = respo.user.profile.email;

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
        size = ids.length;

        var group_options = {
          host: 'api.samanage.com',
          path: '/groups/' + ids[0] + '.json',
          method: 'GET',
          headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
          auth: username + ':' + password
        };

        // get the correct group_id from the Samanage user
        var group_request = https.request(group_options, function (group_response) {
          group_response.setEncoding('utf8');

          var group_body = "";
          group_response.on('data', function (chunk) {
            group_body += chunk;
          });

          group_response.on('end', function () {
            var parsed_group = JSON.parse(group_body);

            Samanage.find_group(ids, size, (err, group_id) => {
              if (err) console.log(err);

              Samanage.my_incidents(group_id, (err, my_incidents_list, list_size) => {
                if (err) console.log(err);

                console.log('\nMY_INCIDENTS: ' + JSON.stringify(my_incidents_list) + '\n');
                attachments = my_incidents_list.slice(0, list_size).map((incident) => {
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
                  response_url: payload.response_url,
                  channel: payload.channel_name,
                  attachments: attachments
                }, msgDefaults);

                res.set('content-type', 'application/json');
                res.status(200).json(msg);
                return
              });

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


 

