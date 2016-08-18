
'use strict';

const _ = require('lodash');
const config = require('../config');
const Botkit = require('botkit');
const Samanage = require('../lib/samanage');

var controller = Botkit.slackbot({
  debug: false
});
var bot = controller.spawn();
var http = require('http');

bot.configureIncomingWebhook({ url: config('WEBHOOK_URL') });

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Samanage',
  icon_emoji: config('ICON_EMOJI')
};


// controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot,message) {

//   bot.api.reactions.add({
//     timestamp: message.ts,
//     channel: message.channel,
//     name: 'robot_face',
//   },function(err,res) {
//       if (err) {
//         bot.botkit.log("Failed to add emoji reaction :(",err);
//       }
//     });

//     controller.storage.users.get(message.user,function(err,user) {
//     if (user && user.name) {
//       bot.reply(message,"Hello " + user.name+"!!");
//     } else {
//       bot.reply(message,"Hello.");
//     }
//   });
// });

// controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot,message) {

//   controller.storage.users.get(message.user,function(err,user) {
//     if (user && user.name) {
//       bot.reply(message,"Your name is " + user.name);
//     } else {
//       bot.reply(message,"I don't know yet!");
//     }
//   });
// });

// controller.hears(['my incidents'], 'direct_message, direct_mention, mention', function(bot, message) {
//   var id = message.user;
//   var options = {user: id};
//   var user = bot.api.users.info(options, function(err, res) {
//     var email = res.user.profile.email;

//     //bot.say("Searching for incidents assigned to: " + email);

//     var incidents = Samanage.my_incidents();

//     var attachments = incidents.slice(0, 5).map((incident) => {
//       return {
//         title: `${incident.title}\n`,
//         title_link: `${incident.title_link}`,
//         pretext: `Ticket: ${incident.number} - Requested by: ${incident.requester}\n`,
//         color: `${incident.color}`,
//         text: `${incident.description}\n\n`,
//         fields: [
//           {
//             title: 'State',
//             value: `${incident.state}`,
//             short: true
//           },
//           {
//             title: 'Priority',
//             value: `${incident.priority}`,
//             short: true
//           }
//         ],
//         footer: 'due on: ',
//         ts: `${incident.ts}`,
//         mrkdown_in: ['text', 'pretext']
//       }
//     });

//     message = _.defaults({ attachments: attachments }, msgDefaults);

//     //bot.reply(message, msg);

//     bot.sendWebhook(message, (err, res) => {
//       if (err) throw err;
//       console.log(`\n🚀 Latest incidents delivered! 🚀`)
//     });
//   });
// });

// controller.hears(['new incidents'], 'direct_message, direct_mention, mention', function(bot, message) {

//   //bot.say("Pulling latest incidents... ");

//   var incidents = Samanage.new_incidents();

//   var attachments = incidents.slice(0, 5).map((incident) => {
//     return {
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
//   }); 

//   message = _.defaults({ attachments: attachments }, msgDefaults);

//   bot.sendWebhook(message, (err, res) => {
//     if (err) throw err;
//     console.log(`\n🚀 Latest incidents delivered! 🚀`)
//   });
// });



