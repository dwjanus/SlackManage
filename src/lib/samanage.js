
'use strict';

const _ = require('lodash');
const config = require('../config');
var https = require('https');

const username = 'devin.janus@samanage.com';
const password = 'BenHobgood666';

const newoptions = {
  host: 'api.samanage.com',
  path: '/incidents.json',
  method: 'GET',
  headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
  auth: username + ':' + password
};

var incident_list = [];

// exports.my_incidents = function (email, callback) {
  
//   const useroptions = {
//     host: 'api.samanage.com',
//     path: '/users.json?email=' + email,
//     method: 'GET',
//     headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
//     auth: username + ':' + password
//   };

//   var samanage_id;

//   var req = https.request(useroptions, function (res) {
//     console.log('STATUS: ' + res.statusCode);
//     console.log('HEADERS: ' + JSON.stringify(res.headers));
//     res.setEncodeing('utf8');

//     res.on('data', function (chunk) {
//       console.log('BODY: ' + chunk);

//       samanage_id = JSON.stringify(chunk);

//       var options = {
//         host: 'api.samanage.com',
//         path: '/incidents.json?=&assigned_to=' + samanage_id,
//         method: 'GET',
//         headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
//         auth: username + ':' + password
//       };

//       var request = https.request(options, function (response) {
        
//         response.on('data', function (chunk) {
//           console.log('BODY: ' + chunk);

//           var incident = {};
//           var incidentjson = JSON.parse(chunk);

//           for(incident in incidentjson) {
//             console.log("key: " + incident + ", value: " + incidentjson[incident]);
//             var current = incidentjson.pop();
            
//             incident.title = current.name;
//             incident.requester = current.requester;
//             incident.description = current.description;
//             incident.assignee = current.assignee;
//             incident_list.push(incident);
//           };
//         });
//       });
//       request.end();
      
//       request.on('error', function (e) {
//         console.log('problem with request: ' + e.message);
//       });

//       callback(null, incident_list);
//     });
//     req.end();

//     req.on('error', function (e) {
//       console.log('problem with request: ' + e.message);
//     });
//   }); 

//   return incident_list;
// };
    
exports.new_incidents = function () {
  var request = https.request(newoptions, function (response) {
    console.log('STATUS: ' + response.statusCode);
    console.log('HEADERS: ' + JSON.stringify(response.headers) + "\n\n");

    response.setEncoding('utf8');
    var body = "";

    response.on('data', function (chunk) {
      body += chunk;
    });

    response.on('end', function () {
      var parsedResponse = JSON.parse(body);
      console.log('First Incident name: ' + JSON.stringify(parsedResponse[0].name) + '\n');

      for (var i = 0; i < 6; i++) {
        var color = "#0067B3";
        if (parsedResponse[i].state == "In Progress")
          color = "#FFB6D1";
        var current = {
          "title" : parsedResponse[i].name,
          "number" : parsedResponse[i].number,
          "title_link" : "http://app.samanage.com/incidents/" + parsedResponse[i].id,
          "description" : parsedResponse[i].description_no_html,
          "requester" : parsedResponse[i].requester.name,
          "requester_email" : parsedResponse[i].requester.email,
          "state" : parsedResponse[i].state,
          "priority" : parsedResponse[i].priority,
          "assignee" : parsedResponse[i].assignee.name,
          "ts" : parsedResponse[i].due_at,
          "color" : color
        };
        console.log('Current incident - ' + i + ': ' + JSON.stringify(current) + '\n');
        incident_list.push(current);
      };
      console.log(JSON.stringify(incident_list));
    });
  }); 
  request.end();

  request.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  }); 

  return incident_list;
};
