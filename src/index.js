
'use strict';

const express = require('express');
const proxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const _ = require('lodash');
const https = require('https');
const config = require('./config');
const commands = require('./commands');
const helpCommand = require('./commands/help');
const util = require('util');
const fs = require('fs');
const slack = require('slack');

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

// app.get('/oauth', (req, res) => { 
//   let payload = req.body;
//   console.log('PAYLOAD for oauth: \n' + util.inspect(payload));

//   fs.readFile('index.html', function(err, page) {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(page);
//     res.end();
//   });
// });


//
// ~~  POST for all incomming slack commands  ~~
//
app.post('/commands/samanage', (req, res) => {
  let payload = req.body;

  if (!payload || payload.token !== config('SAMANAGE_COMMAND_TOKEN')) {
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


//
// ~~  POST for interractive buttons  ~~
//
// app.post('/commands/button', (req, res) => {
//   let payload = req.body;

//   console.log('PAYLOAD for button: \n' + util.inspect(payload));

//   if (!config('CLIENT_ID') || !config('CLIENT_SECRET') || !config('PORT')) {
//     let err = '✋  Dowhatnow? An invalid slack token was provided\n' +
//               '   Is your Slack slash token correctly configured?';
//     console.log(err);
//     res.status(401).end(err);
//     return;
//   }

//   let code = payload.url;
//   slack.oauth.access(config('CLIENT_ID'), config('CLIENT_SECRET'), code);

//   button_action.handler(payload, res);
// });

app.listen(config('PORT'), (err) => {
  if (err) throw err;

  console.log(`\n🚀 Samanagebot LIVES on PORT ${config('PORT')} 🚀`);

  if (config('SLACK_TOKEN')) {
    console.log(`🤖  beep boop: @samanage is real-time\n`);
    bot.listen({ token: config('SLACK_TOKEN') });
  }
});

