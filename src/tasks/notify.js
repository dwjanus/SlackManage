'use strict';

const _ = require('lodash');
const config = require('../config');
const Botkit = require('botkit');
//const Samanage = require('../samanage');

var controller = Botkit.slackbot({
  debug: false
});

var bot = controller.spawn().startRTM();

var http = require('http');

bot.configureIncomingWebhook({ url: config('WEBHOOK_URL') });

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Samanage',
  icon_emoji: config('ICON_EMOJI')
};

controller.hears(['my incidents'], 'direct_message, direct_mention, mention', function(bot, message) {
  id = message.user;
  var options = {user: id};
  user = bot.api.users.info(options, function(err, res) {
    var email = response.user.profile.email;

    bot.reply(message, "Searching for incidents assigned to: " + email);

    var options = {
      host: 'localhost',
      port: 3000,
      path: '/incidents?q=' + email,
      method: 'GET'
    };

    var str = '';
    var req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        str += chunk;
      });

      res.on('end', () => {
        console.log("\n\n\n\n...and: " + str);
        bot.reply(message, str);
        console.log("No more data in response.");
      });
    });

    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
    });
    req.end();

    var attachments = {
      title: 'Incidents',
      color: '#0067B3',
      text: 'This will contain a list with your 5 most recent incidents',
      mrkdown_in: ['text']
    };

    let message = _.defaults({ attachments: attachments }, messageDefaults);

    bot.sendWebhook(message, (err, res) => {
      if (err) throw err;

      console.log(`\n🚀 Latest incidents delivered! 🚀`)
    });

  });
});

//*************************************************** 
//    -- function to alert user if they have -- 
//           been assigned a new incident
//***************************************************

// samanage.new((err, incidents) => {
//   if (err) throw err;

//   var attachments = incidents.slice(0, 4).map((incident) => {
//     return {
//       title: `${incident.title}`,
//       requester: `${incident.requester}`,
//       text: `_${incident.description}_\n`,
//       mrkdwn_in: ['text', 'pretext']
//     };
//   });

//   let message = _.defaults({ attachments: attachments }, messageDefaults);

//   bot.sendWebhook(message, (err, res) => {
//     if (err) throw err;

//     console.log(`\n🚀 Latest incidents delivered! 🚀`)
//   });
// });
