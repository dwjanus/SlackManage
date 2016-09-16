
'use strict';

const _ = require('lodash');
const https = require('https');
const config = require('./config');
var slack = require('slack');
const commands = require('./commands');
const helpCommand = require('./commands/help');
const Samanage = require('./lib/samanage');
const util = require('util');

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');

// Botkit-based Redis store
var Redis_Store = require('./redis_storage.js');
var redis_store = new Redis_Store(process.env.REDIS_URL);

var port = process.env.PORT || process.env.port;

if (!config('CLIENT_ID') || !config('CLIENT_SECRET') || !config('PORT')) {
  console.log('Error: Specify clientId clientSecret and port in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  storage: redis_store
}).configureSlackApp(
  {
    clientId: config('CLIENT_ID'),
    clientSecret: config('CLIENT_SECRET'),
    scopes: ['bot', 'commands', 'incoming-webhook']
  }
);

controller.setupWebserver(port, function (err, webserver) {

  webserver.get('/', (req, res) => {
    res.send('<a href="https://slack.com/oauth/authorize?scope=incoming-webhook,'
    + 'commands,bot&client_id=64177576980.78861190246"><img alt="Add to Slack" '
    + 'height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" '
    + 'srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,'
    + 'https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>');
  });

  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });

  webserver.post('/commands/samanage', (req, res) => {
    let payload = req.body;

    if (!payload || payload.token !== config('OAUTH_TOKEN')) {
      let err = '✋  Dowhatnow? An invalid slash token was provided\n' +
                '   Is your Slack slash token correctly configured?';
      console.log(err);
      res.status(401).end(err);
      return;
    }

    let cmd = _.reduce(commands, (a, cmd) => {
      return payload.text.match(cmd.pattern) ? cmd : a
    }, helpCommand);

    cmd.handler(payload, res);
  });
});


// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
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

controller.hears('hello', ['direct_message', 'direct_mention'], function (bot, message) {
  var userid = message.user;
  var options = {user: userid};
  var email = "";

  // get user slack id, then use that to retrieve email info
  var user = bot.api.users.info(options, (err, respo) => {
    if (err) console.log(err);

    email = respo.user.profile.email;

    bot.reply(message, 'H e l l o ' + respo.user.profile.real_name + '!' );
  });
});


controller.hears('^stop', 'direct_message', function (bot, message) {
  bot.reply(message,'Goodbye');
  bot.rtm.close();
});


controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  let attachments = [
    {
      title: 'Samanagebot will help you view the status of, and modify, your latest incidents',
      color: '#0067B3',
      text: '/samanage new -- returns the 5 newest incidents\n' +
            '/samanage mine -- returns your 5 most recent incidents\n' +
            '/samanage @[number] -- returns specific incident by id\n' +
            '/samanage #[number] -- returns a specific incident by ticket number\n',
      mrkdown_in: ['text']
    },
    {
      title: 'Configuring Samanagebot',
      color: '#E3E4E6',
      text: '/samanage help -- ... youre\'re lookin at it! \n',
      mrkdown_in: ['text']
    }
  ];

  var reply_with_attachments = {
    'username': 'Samanage' ,
    'attachments': attachments,
    'icon_emoji': config('ICON_EMOJI')
  };

  bot.reply(message, reply_with_attachments); 
});

//-------------------------------------------//
//  ~ Handlers for the Samanage functions ~  //
//------------------------------------------ //
controller.hears(['new', 'new incidents, latest'], ['direct_message', 'direct_mention'], function (bot, message) {
  console.log('~INFO~\nBOT: ' + util.inspect(bot) + '\nMESSAGE: ' + util.inspect(message) + '\n');

  Samanage.new_incidents((err, incidents) => {
    if (err) console.log(err);

    var attachments = incidents.slice(0, 5).map((incident) => {
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
    });

    var reply_with_attachments = {
      'username': 'Samanage' ,
      'fallback': 'Searching for latest Incidents',
      'attachments': attachments,
      'icon_emoji': config('ICON_EMOJI')
    };

    bot.reply(message, reply_with_attachments);
  });
});

//---------------------------------------------//
//  ~ [END] Handlers for Samanage functions ~  //
//---------------------------------------------//


//-------------------------------------------//
//  ~ Handlers for the Samanage functions ~  //
//------------------------------------------ //




//-------------------------------------------//
//  ~ Handlers for the Samanage functions ~  //
//------------------------------------------ //


controller.storage.teams.all(function (err, teams) {
  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (var t  in teams) {
    if (teams[t].bot) {
      var bot = controller.spawn(teams[t]).startRTM(function(err) {
        if (err) {
          console.log('Error connecting bot to Slack:', err);
        } else {
          trackBot(bot);
        }
      });
    }
  }
});

