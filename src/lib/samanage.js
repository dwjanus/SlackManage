
const _ = require('lodash');
const config = require('../config');
var https = require('https');

const username = config('username');
const password = config('password');

const newoptions = {
  host: 'https://api.samanage.com',
  path: '/incidents.json',
  method: 'GET',
  headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
  auth: username + ':' + password
};

var incident_list = [];

exports.my_incidents = function (email, callback) {
  
  const useroptions = {
    host: 'https://api.samanage.com',
    path: '/users.json?email=' + email,
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
    auth: username + ':' + password
  };

  var samanage_id;

  var req = https.request(useroptions, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncodeing('utf8');

    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);

      samanage_id = JSON.stringify(chunk);

      var options = {
        host: 'https://api.samanage.com',
        path: '/incidents.json?=&assigned_to=' + samanage_id,
        method: 'GET',
        headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
        auth: username + ':' + password
      };

      var request = https.request(options, function (response) {
        
        response.on('data', function (chunk) {
          console.log('BODY: ' + chunk);

          var incident = {};
          var incidentjson = JSON.parse(chunk);

          for(incident in incidentjson) {
            console.log("key: " + incident + ", value: " + incidentjson[incident]);
            var current = incidentjson.pop();
            
            incident.title = current.name;
            incident.requester = current.requester;
            incident.description = current.description;
            incident.assignee = current.assignee;
            incident_list.push(incident);
          };
        });
      });
      request.end();
      
      request.on('error', function (e) {
        console.log('problem with request: ' + e.message);
      });

      callback(null, incident_list);
    });
    req.end();

    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });
  }); 

  return incident_list;
};
    
exports.new_incidents = function (callback) {
  var req = https.request(newoptions, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncodeing('utf8');

    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);

      var incident = {};
      var incidentjson = JSON.parse(chunk);

      for(var incident in incidentjson) {
        console.log("key: " + incident + ", value: " + incidentjson[incident]);
        var current = incidentjson.pop();
        
        incident.title = current.name;
        incident.requester = current.requester;
        incident.description = current.description;
        incident.assignee = current.assignee;
        incident_list.push(incident);
      };

      callback(null, incident_list);
    });
    req.end();


    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    return incident_list;
  }); 
};
