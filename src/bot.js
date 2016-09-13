
'use strict';

const _ = require('lodash');
const config = require('./config');
const slack = require('slack');
var client = require('redis').createClient(process.env.REDIS_URL);

let bot = slack.rtm.client();

bot.started((payload) => {
  this.self = payload.self;
});

bot.message((msg) => {
  if (!msg.user) return;
  if (!_.includes(msg.text.match(/<@([A-Z0-9])+>/igm), `<@${this.self.id}>`)) return;

  slack.chat.postMessage({
    token: client.get('SLACK_TOKEN'),
    oauth: config('OAUTH_TOKEN'),
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
