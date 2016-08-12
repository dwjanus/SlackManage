
'use strict';

const _ = require('lodash');
const config = require('../config');
const Botkit = require('botkit');
const Samanage = require('../samanage');
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

  message = _.defaults({ attachments: attachments }, msgDefaults);

  bot.sendWebhook(message, (err, res) => {
    if (err) throw err;

    console.log(`\n🚀 Latest incidents delivered! 🚀`)
  });

});

