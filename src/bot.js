
'use strict';

const _ = require('lodash');
const config = require('./config');
const util = require('util');
const slack = require('slack');
var client = require('redis').createClient(process.env.REDIS_URL);

let bot = slack.rtm.client();
var team = "";

bot.started((payload) => {
  this.self = payload.self;
  // console.log('Bot Payload: ' + util.inspect(payload) + '\n');
  team = payload.team.id;
});

bot.message((msg) => {
  if (!msg.user) return;
  if (!_.includes(msg.text.match(/<@([A-Z0-9])+>/igm), `<@${this.self.id}>`)) return;

  var bot_token = "";
  client.hgetall(team, function (err, obj) {
    bot_token = obj['bot_access_token'];
    console.log('bot_token = ' + bot_token + '\n');
  });

  slack.chat.postMessage({
    token: bot_token,
    icon_emoji: config('ICON_EMOJI'),
    channel: msg.channel,
    username: 'Samanage bot',
    text: 'beep boop: What it do tho'
  }, (err, data) => {
    if (err) throw err;

    let txt = _.truncate(data.message.text);

    console.log(`🤖  beep boop: I responded with "${txt}"`);
  });
});

module.exports = bot;
