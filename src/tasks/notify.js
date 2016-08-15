
'use strict';

const _ = require('lodash');
const config = require('../config');
const Botkit = require('botkit');
const Samanage = require('../lib/samanage');
const RequestClient = require('reqclient').RequestClient;

var controller = Botkit.slackbot({
  debug: false
});

var bot = controller.spawn({
  token:process.env.token
}).startRTM();

var http = require('http');

bot.configureIncomingWebhook({ url: config('WEBHOOK_URL') });

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Samanage',
  icon_emoji: config('ICON_EMOJI')
};

controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot,message) {

  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  },function(err,res) {
      if (err) {
        bot.botkit.log("Failed to add emoji reaction :(",err);
      }
    });

    controller.storage.users.get(message.user,function(err,user) {
    if (user && user.name) {
      bot.reply(message,"Hello " + user.name+"!!");
    } else {
      bot.reply(message,"Hello.");
    }
  });
});

controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot,message) {

  controller.storage.users.get(message.user,function(err,user) {
    if (user && user.name) {
      bot.reply(message,"Your name is " + user.name);
    } else {
      bot.reply(message,"I don't know yet!");
    }
  })
});

controller.hears(['my incidents'], 'direct_message, direct_mention, mention', function(bot, message) {
  id = message.user;
  var options = {user: id};
  user = bot.api.users.info(options, function(err, res) {
    var email = response.user.profile.email;

    bot.reply(message, "Searching for incidents assigned to: " + email);

    Samanage.my_incidents(email, (err, incidents) => {
      if (err) throw err;

      var attachments = incidents.slice(0, 4).map((incident) => {
        return {
          title: `${incident.name}/${incident.requester}`,
          color: '#0067B3',
          text: `${incident.assignee}\n_${incident.description}_\n`,
          mrkdown_in: ['text', 'pretext']
        }
      });
    });
  });
});

controller.hears(['incidents'], 'direct_message, direct_mention, mention', function(bot, message) {
  id = message.user;
  var options = {user: id};
  user = bot.api.users.info(options, function(err, res) {
    var email = response.user.profile.email;

    bot.reply(message, "Pulling latest incidents... ");

    Samanage.new_incidents(email, (err, incidents) => {
      if (err) throw err;

      var attachments = incidents.slice(0, 4).map((incident) => {
        return {
          title: `${incident.name}/${incident.requester}`,
          color: '#0067B3',
          text: `${incident.assignee}\n_${incident.description}_\n`,
          mrkdown_in: ['text', 'pretext']
        }
      });  
    });
  });

  message = _.defaults({ attachments: attachments }, msgDefaults);

  bot.sendWebhook(message, (err, res) => {
    if (err) throw err;

    console.log(`\n🚀 Latest incidents delivered! 🚀`)
  });
});



