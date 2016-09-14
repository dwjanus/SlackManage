
'use strict';

const _ = require('lodash');
const config = require('./config');
const util = require('util');
const slack = require('slack');
var client = require('redis').createClient(process.env.REDIS_URL);


var Botkit = require('botkit');

if ( !config('CLIENT_ID') || !config('CLIENT_SECRET') || !config('PORT') ){
  console.log('Error: Specify clientId clientSecret and port in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  json_file_store: './db_slackbutton_bot/',
}).configureSlackApp(
  {
    clientId: config('CLIENT_ID'),
    clientSecret: config('CLIENT_SECRET'),
    redirectUri: 'http://slackmanage.herokuapp.com/auth',
    scopes: ['identify', 'bot', 'commands', 'incoming-webhook'],
  }
);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot (bot) {
  _bots[bot.config.token] = bot;
}

controller.on('create_bot', function (bot, config) {

  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(function (err) {
      if (!err) {
        trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy}, function (err, convo) {
        if (err) {
          console.log(err);
        } else {
          convo.say('I am a bot that has just joined your team');
          convo.say('You must now /invite me to a channel so that I can be of use!');
        }
      });
    });
  }
});


// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});

controller.hears('hello', 'direct_message', function (bot, message) {
  bot.reply(message, 'Hello!');
});

controller.hears('^stop', 'direct_message', function (bot, message) {
  bot.reply(message,'Goodbye');
  bot.rtm.close();
});

controller.on(['direct_message', 'mention', 'direct_mention'], function (bot, message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  },function(err) {
    if (err) { console.log(err) }
    bot.reply(message,'I heard you loud and clear boss.');
  });
});

controller.storage.teams.all(function (err, teams) {

  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (var t  in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM(function (err, bot) {
        if (err) {
          console.log('Error connecting bot to Slack:', err);
        } else {
          trackBot(bot);
        }
      });
    }
  }
});

// let bot = slack.rtm.client();
// var team = "";

// bot.started((payload) => {
//   this.self = payload.self;
//   // console.log('Bot Payload: ' + util.inspect(payload) + '\n');
//   team = payload.team.id;
// });

// bot.message((msg) => {
//   if (!msg.user) return;
//   if (!_.includes(msg.text.match(/<@([A-Z0-9])+>/igm), `<@${this.self.id}>`)) return;

  
//   client.hgetall(team, function (err, obj) {
//     var bot_token = obj['bot_access_token'];
//     console.log('bot_token = ' + bot_token + '\n');
    
//     slack.chat.postMessage({
//       token: bot_token,
//       icon_emoji: config('ICON_EMOJI'),
//       channel: msg.channel,
//       username: 'Samanage bot',
//       text: 'beep boop: What it do tho'
//     }, (err, data) => {
//       if (err) throw err;

//       let txt = _.truncate(data.message.text);

//       console.log(`🤖  beep boop: I responded with "${txt}"`);
//     });
//   });

// });

module.exports = bot;
