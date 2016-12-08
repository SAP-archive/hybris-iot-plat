'use strict'

const 
	options 	= require('../options.js'),
	mqtt    	= require('mqtt'),
	client  	= mqtt.connect(options.mqtt_broker, {username:options.mqtt_username, password:options.mqtt_password}),
	platjson	= require('../platjson'),
	interval 	= 2000,
	tenant		= 'tenant',
	base 		= 'base',
	threshold 	= 50,
	brightness 	= 50,
	mode 		= 'random' //can be random, too, but excludes 10 (EEPROM_UPDATE)
	;


var getRandomRGB = function()
{
  	var r = Math.round(Math.random()*255);
  	var g = Math.round(Math.random()*255);
  	var b = Math.round(Math.random()*255);
  	return [r,g,b];
}

var testPlatformColor = function(base) {
	var rgb = getRandomRGB();
	return platjson.platformColor(base, rgb[0], rgb[1], rgb[2]);
};

var testPlatformSequenceColor = function(base) {
	var rgb = getRandomRGB();
	return platjson.platformSequenceColor(base, rgb[0], rgb[1], rgb[2]);
};

var testPlatformSequenceCleanupColor = function(base) {
	var rgb = getRandomRGB();
	return platjson.platformSequenceCleanupColor(base, rgb[0], rgb[1], rgb[2]);
};

var testPlatformFlash = function(base) {
	var rgb = getRandomRGB();
	//return platjson.platformFlash(base, 255,255,255, 100); //100*10ms duration
	return platjson.platformFlash(base, rgb[0], rgb[1], rgb[2], 100); //100*10ms duration
};

var testPlatformFadePixels = function(base) {
	var rgb = getRandomRGB();
	return platjson.platformFadePixels(base, rgb[0], rgb[1], rgb[2], 10); 
};

var testRotateColor = function(base) {
	var rgb = getRandomRGB();
	return platjson.rotateColor(base, rgb[0], rgb[1], rgb[2], 15); //100ms delay between 
};

var testPlatformIndividualColor = function(base) {
	var triplets = [];
	for (var i = 0; i < 24; i++)
	{
		var r = Math.round(Math.random()*255);
  		var g = Math.round(Math.random()*255);
  		var b = Math.round(Math.random()*255);		
  		triplets[triplets.length] = [r,g,b];
	}
	return platjson.platformIndividualColor(base, triplets);
};

var testPlatformSensorReading = function(base) {
	return platjson.platformSensorReading(base);
};

var testUpdateMeta = function(base) {
	var id = (newPlat == 'random') ? Math.round(Math.random()*255) : parseInt(newPlat, 10);
	var b = (brightness == 'random') ? Math.round(Math.random()*255) : parseInt(brightness, 10);
	return platjson.updateMeta(base, id, threshold, brightness);
};

var testRequestMeta = function(base) {
	return platjson.requestMeta(base);
};

var getRandomPayloadWithoutEEPROM = function(base){
	var randomMode;
	while (randomMode == undefined)
	{
		var mode = Math.round(Math.random()*255);
		if (mode != 10 && modes[mode+''] != undefined)
			randomMode = mode + '';
	}
	return modes[randomMode](base);
}




const modes = {
	'0' : testPlatformColor,
	'1' : testPlatformSequenceColor,
	'2' : testPlatformSequenceCleanupColor,
	'3' : testPlatformIndividualColor,
	'4' : testPlatformSensorReading,
	'5' : testPlatformFlash,
	'6' : testRotateColor,
	'7' : testPlatformFadePixels,
	'10' : testUpdateMeta, //DEGRADES EEPROM
	'11' : testRequestMeta
};

client.on('connect', function () {
  console.log("(re)connected to " + options.mqtt_broker);

  setInterval(function() {
  	var topic = options.mqtt_username + '/' + tenant + '/' + base + '/command';
  	var payload = (mode == 'random') ? getRandomPayloadWithoutEEPROM(base) : modes[mode](base);  	
  	delete payload.plat; //no plat, but base
  	payload.base = base; //no plat, but base
  	var payloadString = JSON.stringify(payload);
  	console.log(topic + ' > ' + payloadString);
  	client.publish(topic, payloadString);
  }, interval);
});
