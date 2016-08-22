
'use strict';

const _ = require('lodash');
const config = require('../config');
var https = require('https');

const username = 'devin.janus@samanage.com';
const password = 'BenHobgood666';

module.exports.my_incidents = function(group_id, size) {
  console.log('Now in my_incidents function!\n' + 'GROUP_ID: ' + group_id + '\nSize: ' + size + '\n');

  var my_incidents = [];

  var options = {
    host: 'api.samanage.com',
    path: '/incidents.json?=&assigned_to=' + group_id,
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
    auth: username + ':' + password
  };

  var request = https.request(options, function (response) {
    response.setEncoding('utf8');
    
    var output_body = "";
    response.on('data', function (chunk) {
      output_body += chunk;
    });

    response.on('end', function () {
      var parsedResponse = JSON.parse(output_body);

      for (var i = 0; i < size; i++) {
        var color = "#0067B3";
        if (parsedResponse[i].state == "In Progress")
          color = "#FF6692";
        if (parsedResponse[i].state == "Resolved")
          color = "#AEFF99";
        if (parsedResponse[i].state == "Closed")
          color = "#E3E4E6";

        var current = {
          "title" : parsedResponse[i].name,
          "number" : parsedResponse[i].number,
          "title_link" : "http://app.samanage.com/incidents/" + parsedResponse[i].id,
          "description" : parsedResponse[i].description_no_html,
          "requester" : parsedResponse[i].requester.name,
          "state" : parsedResponse[i].state,
          "priority" : parsedResponse[i].priority,
          "ts" : parsedResponse[i].due_at,
          "color" : color
        };
        console.log('Current incident - ' + i + ': ' + JSON.stringify(current) + '\n');
        my_incidents.push(current);
      };
    });
  });
  request.end();
  
  request.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });
      
  return my_incidents;
};
    
// ---------------------------------------------------------------
// This fella is gonna handle the request for the latest incidents
// ---------------------------------------------------------------
module.exports.new_incidents = function () {
  var incident_list = [];

  var newoptions = {
    host: 'api.samanage.com',
    path: '/incidents.json?per_page=5&sort_by=updated_at&sort_order=DESC',
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
    auth: username + ':' + password
  };

  var request = https.request(newoptions, function (response) {
    response.setEncoding('utf8');
    var body = "";

    response.on('data', function (chunk) {
      body += chunk;
    });

    response.on('end', function () {
      var parsedResponse = JSON.parse(body);

      for (var i = 0; i <= 4; i++) {
        console.log('BODY: ' + parsedResponse[i] + '\n'); // this is here so we can figure out the assignee issue

        var color = "#0067B3";
        if (parsedResponse[i].state == "In Progress")
          color = "#FF6692";
        if (parsedResponse[i].state == "Resolved")
          color = "#AEFF99";
        if (parsedResponse[i].state == "Closed")
          color = "#E3E4E6";

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
        incident_list.push(current);
      };
    });
  });
  request.end();

  request.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  return incident_list;
};
