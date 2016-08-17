
'use strict';

const slack = require('slack');
const _ = require('lodash');
const config = require('./config');

let bot = slack.rtm.client();

bot.started((payload) => {
  this.self = payload.self;
});

bot.message((msg) => {
  if (!msg.user) return;
  //if (!_.includes(msg.text.match(/<@[A-Z0-9])+>/igm), `<@${this.self.id}>`)) return;

  var id = msg.user;
  var options = {user: id};
  var user = slack.users.info(options, function(err, res) {
    var email = response.user.profile.email;

    slack.chat.postMessage({
      token: config('SLACK_TOKEN'),
      icon_emoji: config('ICON_EMOJI'),
      channel: msg.channel,
      username: "Samanage",
      text: "You are: " + email
    });
  });

  // slack.chat.postMessage({
  //   token: config('SLACK_TOKEN'),
  //   icon_emoji: config('ICON_EMOJI'),
  //   channel: msg.channel,
  //   username: 'Samanage',
  //   text: `beep boop: What it do tho"`
  // }, (err, data) => {
  //   if (err) throw err;

  //   let txt = _.truncate(data.message.text);

  //   console.log(`🤖  beep boop: I responded with "${txt}"`);
  // });
});

module.exports = bot;