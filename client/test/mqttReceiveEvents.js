'use strict'

const 
	options 	= require('../options.js'),
	mqtt    	= require('mqtt'),
	client  	= mqtt.connect(options.mqtt_broker, {username:options.mqtt_username, password:options.mqtt_password})
	;


client.on('connect', function () {
  console.log("(re)connected to " + options.mqtt_broker);
  client.subscribe(options.mqtt_username + '/#');
  //client.subscribe('hansamann/f/tenant/base/67/event');
});

client.on('message', function (topic, message) {
	//console.log(message.toString());
	var obj = JSON.parse(message);
	console.log(obj);
});