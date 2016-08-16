
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

// -->
// This stuff is for testing purposes...
// -->
function samanage() {

  const username = 'devin.janus@samanage.com';
  const password = 'BenHobgood666';

  const options = {
    host: 'api.samanage.com',
    path: '/incidents.json?',
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
    auth: username + ':' + password
  };  

  var incident_list = [];

  var request = https.request(options, function (response) {
    console.log('STATUS: ' + response.statusCode);
    console.log('HEADERS: ' + JSON.stringify(response.headers) + "\n\n");

    response.setEncoding('utf8');
    var body = "";

    response.on('data', function (chunk) {
      body += chunk;
    });

    response.on('end', function () {
      var parsedResponse = JSON.parse(body);
      //console.log('BODY: ' + JSON.stringify(parsedResponse) + "\n\n");
      console.log('First Incident: ' + parsedResponse[0]) + '\n';
    });
        // var incident = chunk.Incident[i];
        // console.log("INCIDENT " + i + ": " + incident + "\n");
        // var current = { "title" : incident.name };
        // console.log("INCIDENT " + i + ": " + current.title + "\n");
        // incident.requester = current.requester;
        // incident.description = current.description;
        // incident.assignee = current.assignee;
        // incident_list.push(current);
      
  }); 
  request.end();

  request.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  }); 

  return incident_list;
};

app.get('/incidents', (req, res) => {  

  res.send(samanage());
});

app.listen(config('PORT'), (err) => {
  if (err) throw err;

  console.log(`\n🚀 Samanagebot LIVES on PORT ${config('PORT')} 🚀`);

  if (config('SLACK_TOKEN')) {
    console.log(`🤖  beep boop: @samanage is real-time\n`);
    bot.listen({ token: config('SLACK_TOKEN') });
  }
});

