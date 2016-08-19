
'use strict';

const _ = require('lodash');
const config = require('../config');
var https = require('https');

const username = 'devin.janus@samanage.com';
const password = 'BenHobgood666';
var incident_list = [];

exports.my_incidents = function(email) {
  console.log('EMAIL: ' + email + '\n');

  var useroptions = {
    host: 'api.samanage.com',
    path: '/users.json?email=' + email,
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
    auth: username + ':' + password
  };
  
  var group_id;
  var group_ids = [];

  var req = https.request(useroptions, function (res) {
    console.log('STATUS: ' + res.statusCode);
    res.setEncoding('utf8');

    var body = "";
    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function () {
      var parsedResponse = JSON.parse(body);
      console.log('BODY: ' + JSON.stringify(parsedResponse) + '\n');
      group_ids = parsedResponse.group_ids;
      console.log('GROUP_IDS: ' + group_ids + '\n');

      var group_path = 'https://api.samanage.com/groups/';
      var found = false;
      var count = 0;
      console.log('SIZE OF GROUP ARRAY: ' + group_ids.size + '\n');

      // while(count < group_ids.size || found == false) {
      //   var group_request = https.get(group_path + group_ids[count] + '.json', function (group_response) {
          
      //     var group_body = "";
      //     group_response.on('data', function (chunk) {
      //       group_body += chunk;
      //     });

      //     group_response.on('end', function () {
      //       var parsed = JSON.parse(group_body);
      //       console.log(JSON.stringify(parsed) + '\n');
      //       if (parsed.is_user == true) {
      //         group_id = group_ids[count];
      //         found = true;
      //       };
      //     });
      //   });
      //   group_request.end();
      // };

    });
  });
  req.end();

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  var options = {
    host: 'api.samanage.com',
    path: '/incidents.json?=&assigned_to=' + group_id,
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
    auth: username + ':' + password
  };

  var request = https.request(options, function (response) {
    response.setEncoding('utf8');
    
    var body = "";
    response.on('data', function (chunk) {
      body += chunk;
    });

    response.on('end', function () {
      var parsedResponse = JSON.parse(body);

      for (var i = 0; i <= 2; i++) {
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
    
// ---------------------------------------------------------------
// This fella is gonna handle the request for the latest incidents
// ---------------------------------------------------------------
exports.new_incidents = function () {
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
