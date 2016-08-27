
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

  res.status(200);

  var userid = payload.user_id;
  var options = {user: userid};
  var email = "";
  var attachments = [];

  // get user slack id, then use that to retrieve email info
  var user = api.users.info(options, function (err, respo) {
    if (err) console.log(err);

    email = respo.user.profile.email;

    console.log('EMAIL: ' + email + '\n');

    // get the correct user from Samanage via their email
    Samanage.getUserInfo({
      host: 'api.samanage.com',
      path: '/users.json?email=' + email,
      method: 'GET',
      headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
      auth: username + ':' + password
    }, (err, ids) => {
      if (err) console.log(err);

      var size = ids.length;
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
          res.json(msg);
          return
        });
      });
    });
  });
};

module.exports = { pattern: /mine/ig, handler: handler };


 

