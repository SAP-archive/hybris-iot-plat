'use strict'

const 
	options 	= require('../options.js'),
	mqtt    	= require('mqtt'),
	client  	= mqtt.connect(options.mqtt_broker, {username:options.mqtt_username, password:options.mqtt_password}),
	platjson	= require('../platjson'),
	tenant		= 'tenant',
	base 		= 'base'
	;


client.on('connect', function () {
  	console.log("(re)connected to " + options.mqtt_broker);

  
	var topic = 'plat/' + tenant + '/' + base + '/command';
	var payload = platjson.platformColor(base, 0, 0, 0);

	delete payload.plat; //no plat, but base
	payload.base = base; //no plat, but base

	var payloadString = JSON.stringify(payload);
	console.log(topic + ' > ' + payloadString);
	client.publish(topic, payloadString);

	process.exit();
 
});
