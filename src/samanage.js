
const _ = require('lodash');
const config = require('../config');
const request = require('request');

var api_url: 'https://api.samanage.com/';
// authorize the api user
request.get(api_url).auth('devin.janus@samanage.com', 'BenHobgood666', false);

// this will handle our api requests
var RequestClient = require('reqclient').RequestClient;
var client = new RequestClient(api_url);

var incident_list;

function my_incidents (email, callback) {
  var samanage_id = JSON.parse(client.get({'uri': 'users.json', 'query': {'email': email}}));
  incident_list = JSON.parse(client.get({'uri': 'incidents.json', 'query': {'assigned_to': + samanage_id}}));
  callback(null, incident_list);
};
  
function new_incidents (callback) {
  incident_list = JSON.parse(client.get({'uri': 'incidents.json'}));
  callback(null, incident_list);
};

module.exports = incidents;