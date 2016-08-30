
'use strict';

const _ = require('lodash');
const config = require('../config');
const https = require('https');
const util = require('util');

const username = 'devin.janus@samanage.com';
const password = 'BenHobgood666';

var found = false;

// ------------------------------------------------------------
// This pal is going to grab the user's Samanage info via email
// ------------------------------------------------------------
function getUserInfo(options, callback) {
  var request = https.request(options, function (response) {
    response.setEncoding('utf8');

    var ids = [];
    var body = "";
    response.on('data', function (chunk) {
      body += chunk;
    });

    response.on('end', function () {
      var parsed = JSON.parse(body);
      ids = parsed[0].group_ids;
      callback(null, ids);
    });
  });
  request.end();

  request.on('error', function (e) {
    return callback(new Error("Problem with request: " + e.message));
  });
}


// ---------------------------------------------------------------------
// This guy is gonna make the actual request given the specific group_id
// ---------------------------------------------------------------------
function groupRequest(options, callback) {
  var request = https.request(options, function (response) {
    var body = "";
    response.on('data', function (chunk) {
      body += chunk;
    });

    response.on('end', function () {
      var parsed = JSON.parse(body);
      callback(null, parsed.is_user);
    });
  });
  request.end();

  request.on('error', function (e) {
    return callback(new Error("Problem with request: " + e.message));
  });
}


// -------------------------------------------------------------------
// This one is gonna iterate through each group_id until user is found
// -------------------------------------------------------------------
function find_group(ids, size, callback, count) {
  if (count === undefined)
    count = 0;
  if (ids === null || count >= size) {
    return callback(new Error("Group Id not located"));
  }

  while(count < size) {
    console.log(count + '\n');
    groupRequest({
      host: 'api.samanage.com',
      path: '/groups/' + ids[count] + '.json',
      method: 'GET',
      headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
      auth: username + ':' + password
    }, (err, found) => {
      if (err) console.log(err);
      
      if (found)
        return callback(null, ids[count]);
    });
    count++;
  }
}


// ---------------------------------------------------------------
// This guy is gonna handle the request for the a user's incidents
// ---------------------------------------------------------------
function my_incidents (group_id, callback) {
  if (group_id === 0) {
    return callback(new Error("Incorrect group_id"));
  }

  var my_incidents_list = [];
  var size = 0;

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

      console.log(util.inspect(parsedResponse) + '\n');
      for(var id in parsedResponse) {
        size++;
      }
      
      if (size > 5)
        size = 5;

      if (size > 0) {
        for (var i = 0; i < size; i++) {
          var color = "#0067B3";
          if (parsedResponse[i].state == "In Progress")
            color = "#FF6692";
          if (parsedResponse[i].state == "Resolved")
            color = "#AEFF99";
          if (parsedResponse[i].state == "Closed")
            color = "#E3E4E6";

          var image_html = parsedResponse[i].description;
          var image_url;
          if (image_html.indexOf('src') !== -1) {
            image_url = image_html.split('src="')[1];
            console.log('ELEMENT after first split: ' + util.inspect(image_url) + '\n');
            image_url = image_url.split(/[\s\"]/)[0];
            console.log('ELEMENT after second split: ' + util.inspect(image_url) + '\n');
          }

          var current = {
            "title" : parsedResponse[i].name,
            "number" : parsedResponse[i].number,
            "title_link" : "http://app.samanage.com/incidents/" + parsedResponse[i].id,
            "image_url" : image_url,
            "description" : parsedResponse[i].description_no_html,
            "requester" : parsedResponse[i].requester.name,
            "state" : parsedResponse[i].state,
            "priority" : parsedResponse[i].priority,
            "ts" : parsedResponse[i].due_at,
            "color" : color
          };
          my_incidents_list.push(current);
        }
      } else {
        var none = {
            "title" : "No Incidents",
            "number" : "000000",
            "title_link" : "http://app.samanage.com/incidents/",
            "description" : "There are currently no incidents assigned to you",
            "requester" : "none",
            "state" : "none",
            "priority" : "none",
            "ts" : "000000000",
            "color" : "#E3E4E6"
          };
        my_incidents_list.push(none);
      }
      callback(null, my_incidents_list, size);
    });
  });
  request.end();
  
  request.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });
}


// ---------------------------------------------------------------
// This fella is gonna handle the request for the latest incidents
// ---------------------------------------------------------------
function new_incidents (callback) {
  
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
      }
      callback(null, incident_list);
    });
  });
  request.end();

  request.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });
}

module.exports.getUserInfo = getUserInfo;
module.exports.find_group = find_group;
module.exports.my_incidents = my_incidents;
module.exports.new_incidents = new_incidents;
