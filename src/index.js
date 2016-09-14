
'use strict';

const express = require('express');
const proxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const _ = require('lodash');
const https = require('https');
const config = require('./config');
const slack = require('slack');
const commands = require('./commands');
const helpCommand = require('./commands/help');
const util = require('util');
var client = require('redis').createClient(process.env.REDIS_URL);

let bot = require('./bot');
let app = express();

if (config('PROXY_URI')) {
  app.use(proxy(config('PROXY_URI'), {
    forwardPath: (req, res) => { return require('url').parse(req.url).path }
  }));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('<a href="https://slack.com/oauth/authorize?scope=incoming-webhook,'
    + 'commands,bot&client_id=64177576980.78861190246"><img alt="Add to Slack" '
    + 'height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" '
    + 'srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,'
    + 'https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>');
});

app.get('/auth', (req, res) => {
  var url = req.url;
  console.log('url: ' + url + '\n');
  var codePos = url.indexOf("code="); //index where code starts in the url
  var codeStart = codePos + 5; //we dont want the 'code=' part
  var codeEnd = url.indexOf("&"); //we dont need anything else
  var accessCode = url.substring(codeStart, codeEnd).toString(); //put it all together
  console.log('Access Code: ' + accessCode + '\n');

  var request = require('request');
  request('https://slack.com/api/oauth.access?client_id=' + process.env.CLIENT_ID + '&client_secret=' + process.env.CLIENT_SECRET + '&code=' + accessCode,
    function (error, response, body) {
      if (error)
        console.log(error);

      var responseJson = JSON.parse(body);
      if (responseJson.ok) {
        console.log('ResponseJSON: ' + util.inspect(responseJson) + '\n');

        var accessToken = responseJson['access_token'];
        var teamId = responseJson['team_id'];
        var webhookUrl = responseJson['incoming_webhook']['url'];
        var botUserId = responseJson['bot']['bot_user_id'];
        var botAccessToken = responseJson['bot']['bot_access_token'];

        console.log("    --> " + accessToken + "\n    --> " + teamId + "\n    --> ");
        console.log(webhookUrl + "\n    --> " + botUserId + "\n    --> " + botAccessToken + '\n');
        
        client.hmset(teamId, {
          "access_token": accessToken,
          "webhook_url": webhookUrl,
          "bot_access_token": botAccessToken,
          "bot_user_id": botUserId
        });
        
        client.hgetall(teamId.toString(), function (err, obj) {
          if (err) console.log(err);
          console.dir(obj);
        });
      }
  });
  res.sendStatus(200);

  // // Verify user accepted auth request
  // if (codePos > -1) {
  //   var request = https.request({
  //     host: 'slack.com',
  //     path: '/api/oauth.access?client_id=' + process.env.CLIENT_ID + '&client_secret=' + process.env.CLIENT_SECRET + '&code=' + accessCode,
  //     method: 'POST',
  //     headers: {'Content-Type' : 'application/x-www-form-urlencoded'}
  //   }, (response) => {
  //     response.setEncoding('utf8');
      
  //     var body = "";
  //     response.on('data', (chunk) => {
  //       body += chunk;
  //     });

  //     console.log('Body: ' + util.inspect(body) + '\n');

  //     response.on('end', () => {
  //       var teamInfo = JSON.parse(body);
  //       console.log('TeamInfo: ' + util.inspect(teamInfo) + '\n');
  //       if (teamInfo.ok === true) {
  //         // save the ACCESS_CODE
  //         // client.set("ACCESS_TOKEN", teamInfo.access_token);
  //         // client.set("WEBHOOK_URL", teamInfo.incoming_webhook.url);
  //         // client.set("SLACK_TOKEN", teamInfo.bot.bot_access_token);
  //         console.log('teamInfo is okay' + '\n');
  //       } else {
  //         // Error
  //       }
  //     });
  //   });
  //   request.end();

  //   request.on('error', (e) => {
  //     return callback(new Error("Problem with request: " + e.message));
  //   });
  // } else {
  //   // Reroute user back to install page, they denied auth
  // }
});

app.post('/commands/samanage', (req, res) => {
  let payload = req.body;
  console.log('Payload: ' + util.inspect(payload) + '\n');
  
  var team_id = payload.team_id;
  var access = "";

  client.get(team_id["access_token"], function (err, reply) {
    if (err) console.log(err);
    console.log(reply.toString() +'\n');
    access = reply.toString();
  });

  if (!payload || payload.token !== access ) {
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

app.post('/action', (req, res) => {
  let payload = req.body;
  console.log(util.inspect(payload) + '\n');
  res.set('Content-Type', 'application/json');
  res.status(200).json('Button Clicked!');
});

app.listen(config('PORT'), (err) => {
  if (err) throw err;

  console.log(`\n🚀 Samanagebot LIVES on PORT ${config('PORT')} 🚀`);

  if (config('SLACK_TOKEN')) {
    console.log(`🤖  beep boop: @samanage is real-time\n`);
    bot.listen({ token: config('SLACK_TOKEN') });
  }
});

