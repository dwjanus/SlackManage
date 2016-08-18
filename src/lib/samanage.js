
'use strict';

const _ = require('lodash');
const config = require('../config');
var https = require('https');

const username = 'devin.janus@samanage.com';
const password = 'BenHobgood666';

var incident_list = [];

exports.my_incidents = function (email) {
  console.log('EMAIL: ' + email + '\n');

  var useroptions = {
    host: 'api.samanage.com',
    path: '/users.json?email=' + email,
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
    auth: username + ':' + password
  };

  var samanage_id = '';

  var req = https.request(useroptions, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers) + '\n');
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk + '\n');
      var body = JSON.parse(chunk);
      samanage_id = body.id;
      console.log('Samanage ID: ' + samanage_id + '\n');
    });
  });
  req.end();

  req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
  });

  var options = {
    host: 'api.samanage.com',
    path: '/incidents.json?=&assigned_to=' + samanage_id,
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'content_type' : 'application/json' },
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
      console.log('First Incident name: ' + JSON.stringify(parsedResponse[0].name) + '\n');

      for (var i = 0; i < 6; i++) {
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
    
// ---------------------------------------------------------------
// This fella is gonna handle the request for the latest incidents
// ---------------------------------------------------------------
exports.new_incidents = function () {
  var newoptions = {
    host: 'api.samanage.com',
    path: '/incidents.json',
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

      for (var i = 0; i < 6; i++) {
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
