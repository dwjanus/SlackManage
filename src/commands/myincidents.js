
'use strict';

const _ = require('lodash');
const config = require('../config');
const Samanage = require('../lib/samanage');
const util = require('util');
const slack = require('slack');
const https = require('https');

var samanage_options = config('samanage_options');
var api = slack.api.client(config('SLACK_TOKEN'));

const msgDefaults = {
  response_type: 'in_channel',
  username: 'mine',
  icon_emoji: config('ICON_EMOJI')
};

const handler = (payload, res) => {

  var url = payload.response_url;
  var userid = payload.user_id;
  var options = {user: userid};
  var email = "";

  // get user slack id, then use that to retrieve email info
  var user = api.users.info(options, (err, respo) => {
    if (err) console.log(err);

    email = respo.user.profile.email;

    let pre = _.defaults({
      channel: payload.channel_name,
      text: 'Most recently updated incidents for ' + respo.user.profile.real_name + '...'
    }, msgDefaults);

    res.set('Content-Type', 'application/json');
    res.send(pre);
  });
    
  // get the correct user from Samanage via their email
  samanage_options.path = '/users.json?=&email=' + email;
  Samanage.getUserInfo(samanage_options, (err, ids) => {
    if (err) console.log(err);

    var size = ids.length;
    Samanage.find_group(ids, size, (err, group_id) => {
      if (err) console.log(err);

      Samanage.my_incidents(group_id, (err, my_incidents_list, list_size) => {
        if (err) console.log(err);

        let attachments = my_incidents_list.slice(0, list_size).map((incident) => {
          return {
            title: `${incident.title}\n`,
            title_link: `${incident.title_link}`,
            pretext: `Ticket: ${incident.number} - Requested by: ${incident.requester}\n`,
            color: `${incident.color}`,
            image_url: `${incident.image_url}`,
            fields: [
              {
                title: "Description",
                value: `${incident.description}\n\n`,
                short: false
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
        }); 

        let msg = _.defaults({
          channel: payload.channel_name,
          attachments: attachments
        }, msgDefaults);

        var post_options = {
           host: 'hooks.slack.com',
           path: '/' + url.split('.com/')[1],
           method: 'POST',
           headers: { 'Content-Type' : 'application/json', 'Cache-Control' : 'no-cache, no-store' },
           port: 443
        };
        
        var request = https.request(post_options, (response) => {
          response.setEncoding('utf8');
        });

        request.on('error', (e) => {
          console.log('problem with request: ' + e.message);
        });
        request.write(JSON.stringify(msg));
        request.end();
        user = null;
        return;
      });
    });
  });
};

module.exports = { pattern: /mine/ig, handler: handler };






  


 

