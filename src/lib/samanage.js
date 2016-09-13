
'use strict';

const _ = require('lodash');
const config = require('../config');
const util = require('util');
const https = require('https');
var samanage_options = config('samanage_options');

// ------------------------------------------------------------
// This pal is going to grab the user's Samanage info via email
// ------------------------------------------------------------
function getUserInfo(options, callback) {
  var request = https.request(options, (response) => {
    response.setEncoding('utf8');

    var ids = [];
    var body = "";
    response.on('data', (chunk) => {
      body += chunk;
    });

    response.on('end', () => {
      var parsed = JSON.parse(body);
      ids = parsed[0].group_ids;
      callback(null, ids);
    });
  });
  request.end();

  request.on('error', (e) => {
    return callback(new Error("Problem with request: " + e.message));
  });
}


// -------------------------------------------------------------------
// This one is gonna iterate through each group_id until user is found
// -------------------------------------------------------------------
var found = false;
function find_group(ids, size, callback, count) {
  if (count === undefined)
    count = 0;
  if (ids === null || count >= size) {
    return callback(new Error("Group Id not located"));
  }

  while(count < size) {
    console.log(count + '\n');
    var group_options = samanage_options;
    group_options.path = '/groups/' + ids[count] + '.json';
    groupRequest(group_options, (err, found) => {
      if (err) console.log(err);
      
      if (found)
        return callback(null, ids[count]);
    });
    count++;
  }
}


// ---------------------------------------------------------------------
// This guy is gonna make the actual request given the specific group_id
// ---------------------------------------------------------------------
function groupRequest(options, callback) {
  var request = https.request(options, (response) => {
    var body = "";
    response.on('data', (chunk) => {
      body += chunk;
    });

    response.on('end', () => {
      var parsed = JSON.parse(body);
      callback(null, parsed.is_user);
    });
  });
  request.end();

  request.on('error', (e) => {
    return callback(new Error("Problem with request: " + e.message));
  });
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
  var my_options = samanage_options;
  my_options.path ='/incidents.json?=&assigned_to%5B%5D=' + group_id + '&per_page=5&sort_by=updated_at&sort_order=DESC';
  var request = https.request(my_options, (response) => {
    response.setEncoding('utf8');
    
    var output_body = "";
    response.on('data', (chunk) => {
      output_body += chunk;
    });

    response.on('end', () => {
      var parsedResponse = JSON.parse(output_body);

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
          var image_url = "";
          if (image_html.indexOf('src') !== -1) {
            image_url = image_html.split('src="')[1];
            console.log('ELEMENT after first split: ' + util.inspect(image_url) + '\n');
            image_url = image_url.split(/[\s\"]/)[0];
            console.log('ELEMENT after second split: ' + util.inspect(image_url) + '\n');
          }

          var current = {
            "title": parsedResponse[i].name,
            "number": parsedResponse[i].number,
            "title_link": "http://app.samanage.com/incidents/" + parsedResponse[i].id,
            "description": parsedResponse[i].description_no_html,
            "requester": parsedResponse[i].requester.name,
            "state": parsedResponse[i].state,
            "priority": parsedResponse[i].priority,
            "image_url": image_url,
            "ts": parsedResponse[i].due_at,
            "color": color
          };

          if (parsedResponse[i].description_no_html === '') {
            current.description = "No description available";
          }
          my_incidents_list.push(current);
        }
      } else {
        var none = {
            "title": "There are currently no incidents assigned to you",
            "number": "000000",
            "title_link": "http://app.samanage.com/incidents/",
            "description": "Woo! Go catch up on some reading",
            "requester": "none",
            "state": "none",
            "priority": "none",
            "ts": "000000000",
            "color": "#E3E4E6"
          };
        my_incidents_list.push(none);
      }
      callback(null, my_incidents_list, size);
    });
  });
  request.end();
  
  request.on('error', (e) => {
    console.log('problem with request: ' + e.message);
  });
}


// ---------------------------------------------------------------
// This fella is gonna handle the request for the latest incidents
// ---------------------------------------------------------------
function new_incidents (callback) {
  
  var incident_list = [];
  var new_options = samanage_options;
  new_options.path = '/incidents.json?=&per_page=5&sort_by=updated_at&sort_order=DESC';
  
  var request = https.request(new_options, (response) => {
    response.setEncoding('utf8');
    var body = "";

    response.on('data', (chunk) => {
      body += chunk;
    });

    response.on('end', () => {
      var parsedResponse = JSON.parse(body);

      for (var i = 0; i <= 4; i++) {
        var color = "#0067B3";
        if (parsedResponse[i].state == "In Progress")
          color = "#FF6692";
        if (parsedResponse[i].state == "Resolved")
          color = "#AEFF99";
        if (parsedResponse[i].state == "Closed")
          color = "#E3E4E6";

        var image_html = parsedResponse[i].description;
        var image_url = "";
        if (image_html.indexOf('src') !== -1) {
          image_url = image_html.split('src="')[1];
          console.log('ELEMENT after first split: ' + util.inspect(image_url) + '\n');
          image_url = image_url.split(/[\s\"]/)[0];
        }

        var current = {
          "title": parsedResponse[i].name,
          "number" : parsedResponse[i].number,
          "title_link" : "http://app.samanage.com/incidents/" + parsedResponse[i].id,
          "description" : parsedResponse[i].description_no_html,
          "requester" : parsedResponse[i].requester.name,
          "requester_email" : parsedResponse[i].requester.email,
          "state" : parsedResponse[i].state,
          "priority" : parsedResponse[i].priority,
          "assignee": parsedResponse[i].assignee.name,
          "image_url": image_url,
          "ts": parsedResponse[i].due_at,
          "color": color
        };

        incident_list.push(current);
      }
      callback(null, incident_list);
    });
  });
  request.end();

  request.on('error', (e) => {
    console.log('problem with request: ' + e.message);
  });
}


// ------------------------------------------------------------------------
// This one is gonna iterate through each incident id until number is found
// ------------------------------------------------------------------------
function find_incident (number, callback) {
  var perpage;
  var address;
  var page = 1;
  var difference = 0;
  var first_options = samanage_options;
  first_options.path = '/incidents.json?=&per_page=1';
  
  // lets do some quick math to get roughly the page we are looking for the incident on
  var request = https.request(first_options, (response) => {
    response.setEncoding('utf8');
    var body = "";

    response.on('data', (chunk) => {
      body += chunk;
    });

    response.on('end', () => {
      var parsed = JSON.parse(body);
      difference = parsed[0].number - number;

      if (difference < 100) {
        perpage = difference+1;
        address = difference;
      }
      else {
        page = Math.ceil(difference/100);
        perpage = 100;
        address = (difference%100)-1;
      }
      
      // go through all incidents and look for the one that matches number
      var match_options = samanage_options;
      match_options.path = '/incidents.json?=&per_page=' + perpage + '&page=' + page;
      incidentRequest(match_options, address, number, (err, incident_number, incident_id) => {
        if (err) console.log(err);
        callback(null, incident_number, incident_id);
      });
    });
  });
  request.end();

  request.on('error', (e) => {
    return callback(new Error("Problem with request: " + e.message));
  });
}


// ---------------------------------------------------------------------
// This guy is gonna make the actual request given the specific group_id
// ---------------------------------------------------------------------
function incidentRequest (options, address, number, callback) {
  var request = https.request(options, (response) => {
    response.setEncoding('utf8');
    var body = "";

    response.on('data', (chunk) => {
      body += chunk;
    });

    response.on('end', () => {
      var parsed = JSON.parse(body);
      var count = 0;
      while(count <= address) {
        if (parsed[count].number == number)
          return callback(null, parsed[count].number, parsed[count].id);
        else
          count++;
      }
    });
  });
  request.end();

  request.on('error', (e) => {
    return callback(new Error("Problem with request: " + e.message));
  });
}


// ----------------------------------------------------------------------
// This chap is gonna make the actual request given the specific group_id
// ----------------------------------------------------------------------
function incident (options, callback) {
  var request = https.request(options, (response) => {
    response.setEncoding('utf8');
    var body = "";

    response.on('data', (chunk) => {
      body += chunk;
    });

    response.on('end', () => {
      var parsedResponse = JSON.parse(body);
      var color = "#0067B3";
      if (parsedResponse.state === "In Progress")
        color = "#FF6692";
      if (parsedResponse.state === "Resolved")
        color = "#AEFF99";
      if (parsedResponse.state ==="Closed")
        color = "#E3E4E6";

      var image_html = parsedResponse.description;
      var image_url = "";
      if (image_html.indexOf('src') !== -1) {
        image_url = image_html.split('src="')[1];
        image_url = image_url.split(/[\s\"]/)[0];
      }

      var current = {
        "title": parsedResponse.name,
        "number": parsedResponse.number,
        "title_link": "http://app.samanage.com/incidents/" + parsedResponse.id,
        "description": parsedResponse.description_no_html,
        "requester": parsedResponse.requester.name,
        "requester_email": parsedResponse.requester.email,
        "requester_icon": parsedResponse.created_by.avatar,
        "state": parsedResponse.state,
        "priority": parsedResponse.priority,
        "assignee": parsedResponse.assignee.name,
        "image_url": image_url,
        "comments_num": parsedResponse.number_of_comments,
        "ts": parsedResponse.due_at,
        "color": color
      };

      callback(null, current);
    });
  });
  request.end();

  request.on('error', (e) => {
    console.log('problem with request: ' + e.message);
  });
}

module.exports.getUserInfo = getUserInfo;
module.exports.find_group = find_group;
module.exports.my_incidents = my_incidents;
module.exports.new_incidents = new_incidents;
module.exports.find_incident = find_incident;
module.exports.incident = incident;
