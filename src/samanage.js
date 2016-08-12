
const _ = require('lodash');
const config = require('./config');
const request = require('request');
const RequestClient = require('reqclient').RequestClient;
const api_url = 'https://api.samanage.com/';

// authorize the api user
request.get(api_url).auth('devin.janus@samanage.com', 'BenHobgood666', false);

// this will handle our api requests
var client = new RequestClient(api_url);

var incident_list;

module.exports = {
  my_incidents: function (email, callback) {
    var samanage_id = JSON.parse(client.get({'uri': 'users.json', 'query': {'email': email}}));
    incident_list = JSON.parse(client.get({'uri': 'incidents.json', 'query': {'assigned_to': + samanage_id}}));
    callback(null, incident_list);
  },
    
  new_incidents: function (callback) {
    incident_list = JSON.parse(client.get({'uri': 'incidents.json'}));
    callback(null, incident_list);
  }
};
