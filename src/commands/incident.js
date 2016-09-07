
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
    path: '/incidents/' + number + '.json',
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
    auth: config('API_USER') + ':' + config('API_PASS')
  };

  var pre_text = 'with id: ';
  if (cmd === '@') {
    let pre = _.defaults({
      channel: payload.channel_name,
      text: 'Finding Incident ' + pre_text + number + '...'
    }, msgDefaults);

    res.set('Content-Type', 'application/json');
    res.send(pre);

  } else {
    pre_text = 'with ticket number: ';
    let pre = _.defaults({
      channel: payload.channel_name,
      text: 'Finding Incident ' + pre_text + number + '...'
    }, msgDefaults);

    res.set('Content-Type', 'application/json');
    res.send(pre);

    Samanage.find_incident(number, (err, incident_number, incident_id) => {
      if(err) console.log(err);
      options.path = '/incidents/' + incident_id + '.json';

      console.log(util.inspect(options) + '\n');

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

        let url = payload.response_url;

        var post_options = {
           host: 'hooks.slack.com',
           path: '/' + url.split('.com/')[1],
           method: 'POST',
           headers: { 'Content-Type' : 'application/json' },
           port: 443
        };
        
        var request = https.request(post_options, function (response) {
          response.setEncoding('utf8');
        });

        request.on('error', function (e) {
          console.log('problem with request: ' + e.message);
        });
        request.write(JSON.stringify(msg));
        request.end();

        return;
      });
    });
  }

  // Samanage.incident(options, (err, incident) => {
  //   if (err) console.log(err);

  //   var attachments = [
  //     {
  //       title: `${incident.title}\n`,
  //       title_link: `${incident.title_link}`,
  //       pretext: `Ticket: ${incident.number} - Requested by: ${incident.requester}\n`,
  //       color: `${incident.color}`,
  //       text: `${incident.description}\n\n`,
  //       fields: [
  //         {
  //           title: 'Assigned To',
  //           value: `${incident.assignee}`,
  //           short: true
  //         },
  //         {
  //           title: 'State',
  //           value: `${incident.state}`,
  //           short: true
  //         },
  //         {
  //           title: 'Priority',
  //           value: `${incident.priority}`,
  //           short: true
  //         }
  //       ],
  //       footer: 'due on: ',
  //       ts: `${incident.ts}`,
  //       mrkdown_in: ['text', 'pretext']
  //     }
  //   ];  

  //   let msg = _.defaults({
  //     channel: payload.channel_name,
  //     attachments: attachments
  //   }, msgDefaults);

  //   let url = payload.response_url;

  //   var post_options = {
  //      host: 'hooks.slack.com',
  //      path: '/' + url.split('.com/')[1],
  //      method: 'POST',
  //      headers: { 'Content-Type' : 'application/json' },
  //      port: 443
  //   };
    
  //   var request = https.request(post_options, function (response) {
  //     response.setEncoding('utf8');
  //   });

  //   request.on('error', function (e) {
  //     console.log('problem with request: ' + e.message);
  //   });
  //   request.write(JSON.stringify(msg));
  //   request.end();

  //   return;
  // });
};

module.exports = { pattern: /(@|#)+[0-9]/ig, handler: handler };
