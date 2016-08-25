
'use strict';

const _ = require('lodash');
const config = require('../config');
var https = require('https');
var http = require('http');

const username = 'devin.janus@samanage.com';
const password = 'BenHobgood666';

var count = 0;
var found = false;

function makeRequest(options, callback) {
  var group_id_request = https.request(options, function (group_id_response) {
    var group_id_body = "";
    group_id_response.on('data', function (chunk) {
      group_id_body += chunk;
    });

    group_id_response.on('end', function () {
      var parsed = JSON.parse(group_id_body);
      console.log('PARSED: ' + JSON.stringify(parsed) + '\n');
      callback(null, parsed.is_user);
    });
  });
  group_id_request.end();

  group_id_request.on('error', function (e) {
    console.log('problem with request: ' + e.message);
    return callback(new Error("Problem with request"));
  });
}

function find_group(params, callback) {
  if (params === null) {
    return callback(new Error("No Group Ids"));
  }

  makeRequest({
    host: 'api.samanage.com',
    path: '/groups/' + params[count].toString() + '.json',
    method: 'GET',
    headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
    auth: username + ':' + password
  }, (err, found) => {
    if (found)
      return callback(null, params[count].toString());
    else
      count++;
  });
  
  setTimeout(find_group, 20000);
}

// function find_group (ids, callback) {
//   if (ids.length === 0) {
//     return callback(new Error("No Group Ids"));
//   }

//   if (ids.length == 1) {
//     callback(null, ids[0].toString());
//   } else {
//     var count = 0;
//     var found = false;

//     while((found === false) || (count < ids.length)) {
//       var group_id_options = {
//         host: 'api.samanage.com',
//         path: '/groups/' + ids[count].toString() + '.json',
//         method: 'GET',
//         headers: { 'accept' : 'application/vnd.samanage.v1.3+json', 'Content-Type' : 'application/json' },
//         auth: username + ':' + password
//       };

//       var group_id_request = https.request(group_id_options, function (group_id_response) {
//         var group_id_body = "";
//         group_id_response.on('data', function (chunk) {
//           group_id_body += chunk;
//         });

//         group_id_response.on('end', function () {
//           var parsed = JSON.parse(group_id_body);
//           console.log('PARSED: ' + JSON.stringify(parsed) + '\n');
//           found = parsed.is_user;
//           if (found)
//             callback(null, ids[count].toString());
//           else
//             count++;
//         });
//       });
//       group_id_request.end();

//       group_id_request.on('error', function (e) {
//         console.log('problem with request: ' + e.message);
//       });
//     }
//   }
// }


// ---------------------------------------------------------------
// This guy is gonna handle the request for the a user's incidents
// ---------------------------------------------------------------
function my_incidents (group_id, callback) {
  if (group_id === 0) {
    return callback(new Error("Incorrect group_id"));
  }

  console.log('Now in my_incidents function!\n' + 'GROUP_ID: ' + group_id + '\nSize: ' + size + '\n');

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
      
      for(var id in parsedResponse) {
        size++;
      }

      if (size > 0) {
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
      console.log('MY INCIDENT LIST: ' + JSON.stringify(my_incidents_list) + ' ' + typeof my_incidents_list + '\n');
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
          // "assignee" : parsedResponse[i].assignee.name,
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

module.exports.my_incidents = my_incidents;
module.exports.new_incidents = new_incidents;
module.exports.find_group = find_group;
