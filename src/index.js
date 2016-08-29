
'use strict';

const express = require('express');
const proxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const _ = require('lodash');
const https = require('https');
const config = require('./config');
const commands = require('./commands');
const helpCommand = require('./commands/help');

let bot = require('./bot');

let app = express();

if (config('PROXY_URI')) {
  app.use(proxy(config('PROXY_URI'), {
    forwardPath: (req, res) => { return require('url').parse(req.url).path }
  }));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => { res.send('\n 👋 🌍 \n') });

var cmd;
var url;
var host;
var post_path;

app.get('/commands/samanage', (req, res) => {
  let payload = req.body;
  url = payload.response_url;
  console.log('RESPONSE_URL: ' + url + '\n');
  host = url.split('.com/')[0] + '.com';
  post_path = '/' + url.split('.com/')[1];
});

app.post(post_path.toString(), (req, res) => {
  let payload = req.body;

  if (!payload || payload.token !== config('SAMANAGE_COMMAND_TOKEN')) {
    let err = '✋  Dowhatnow? An invalid slash token was provided\n' +
              '   Is your Slack slash token correctly configured?';
    console.log(err);
    res.status(401).end(err);
    return;
  }

  cmd = _.reduce(commands, (a, cmd) => {
    return payload.text.match(cmd.pattern) ? cmd : a
  }, helpCommand);
  
  console.log('RESPONSE_URL parsed: ' + host + '\n' + path + ' ' + typeof path + '\n');

  cmd.handler(payload, res);
});

app.listen(config('PORT'), (err) => {
  if (err) throw err;

  console.log(`\n🚀 Samanagebot LIVES on PORT ${config('PORT')} 🚀`);

  if (config('SLACK_TOKEN')) {
    console.log(`🤖  beep boop: @samanage is real-time\n`);
    bot.listen({ token: config('SLACK_TOKEN') });
  }
});

