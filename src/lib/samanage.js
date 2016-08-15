
const _ = require('lodash');
const config = require('../config');
var https = require('https');

const username = config('username');
const password = config('password');

const options = {
  host: 'https://api.samanage.com/',
  path: '/incidents.json',
  method: 'GET',
  auth: username + ':' + password
};

module.exports = {

  //var incident_list;

  my_incidents: function (email, callback) {
    var req = https.request(options, function (res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncodeing('utf8');

      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });

      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

      req.end();
    });

    // var samanage_id = JSON.parse(client.get({'uri': 'users.json', 'query': {'email': email}}));
    // incident_list = JSON.parse(client.get({'uri': 'incidents.json', 'query': {'assigned_to': + samanage_id}}));
    // callback(null, incident_list);
  },
    
  new_incidents: function (callback) {
    var req = https.request(options, function (res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncodeing('utf8');

      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });

      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

      req.end();
    });

    // incident_list = JSON.parse(client.get({'uri': 'incidents.json'}));
    // callback(null, incident_list);
  }
};
