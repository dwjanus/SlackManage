'use strict';

const _ = require('lodash');
const config = require('../config');
const Botkit = require('botkit');
//const Samanage = require('../samanage');

var controller = Botkit.slackbot({});
var bot = controller.spawn();

bot.configureIncomingWebhook({ url: config('WEBHOOK_URL') });

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Samanagebot',
  icon_emoji: config('ICON_EMOJI')
};

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

//   let msg = _.defaults({ attachments: attachments }, msgDefaults);

//   bot.sendWebhook(msg, (err, res) => {
//     if (err) throw err;

//     console.log(`\n🚀 Latest incidents delivered! 🚀`)
//   });
// });
