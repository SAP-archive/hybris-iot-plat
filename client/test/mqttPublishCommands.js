'use strict'

const 
	options 	= require('../options.js'),
	mqtt    	= require('mqtt'),
	client  	= mqtt.connect(options.mqtt_broker, {username:options.mqtt_username, password:options.mqtt_password}),
	platjson	= require('../platjson'),
	tenant		= 'tenant',
	base 		= 'base',
	interval 	= 5000,
	minPlat 	= 100,
	maxPlat		= 200,
	threshold 	= 50,
	brightness 	= 50,
	pixels 		= 24,
	plat 		= '100', //can be random, too
	newPlat		= '100', //can be random, too
	mode 		= '4' //can be random, too, but excludes 10 (EEPROM_UPDATE)
	;


var getRandomRGB = function()
{
  	var r = Math.round(Math.random()*255);
  	var g = Math.round(Math.random()*255);
  	var b = Math.round(Math.random()*255);
  	return [r,g,b];
}

var getPlat = function()
{
	if (plat == 'random')
	{
		var p;
		while (p == undefined || p < minPlat || p > maxPlat)
		{
			p = Math.round(Math.random()*maxPlat);
		}
		return p;
	}
	else
	{
		return parseInt(plat, 10);
	}
	
}

var testPlatformColor = function(platID) {
	var rgb = getRandomRGB();
	return platjson.platformColor(platID, rgb[0], rgb[1], rgb[2]);
};

var testPlatformSequenceColor = function(platID) {
	var rgb = getRandomRGB();
	return platjson.platformSequenceColor(platID, rgb[0], rgb[1], rgb[2]);
};

var testPlatformFlash = function(platID) {
	var rgb = getRandomRGB();
	return platjson.platformFlash(platID, rgb[0], rgb[1], rgb[2], 100); //100*10ms duration
};

var testPlatformFadePixels = function(platID) {
	var rgb = getRandomRGB();
	return platjson.platformFadePixels(platID, rgb[0], rgb[1], rgb[2], 10); //100*10ms duration
};

var testRotateColor = function(platID) {
	var rgb = getRandomRGB();
	return platjson.rotateColor(platID, rgb[0], rgb[1], rgb[2], 15); //100ms delay between 
};

var testPlatformSequenceCleanupColor = function(platID) {
	var rgb = getRandomRGB();
	return platjson.platformSequenceCleanupColor(platID, rgb[0], rgb[1], rgb[2]);
};

var testPlatformIndividualColor = function(platID) {
	var triplets = [];
	for (var i = 0; i < 24; i++)
	{
		var r = Math.round(Math.random()*255);
  		var g = Math.round(Math.random()*255);
  		var b = Math.round(Math.random()*255);		
  		triplets[triplets.length] = [r,g,b];
	}
	return platjson.platformIndividualColor(platID, triplets);
};

var testPlatformSensorReading = function(platID) {
	return platjson.platformSensorReading(platID);
};

var testUpdateMeta = function(platID) {
	var id = (newPlat == 'random') ? Math.round(Math.random()*255) : parseInt(newPlat, 10);
	var b = (brightness == 'random') ? Math.round(Math.random()*255) : parseInt(brightness, 10);
	return platjson.updateMeta(platID, id, threshold, b, pixels);
};

var testRequestMeta = function(platID) {
	return platjson.requestMeta(platID);
};

var getRandomPayloadWithoutEEPROM = function(platID){
	var randomMode;
	while (randomMode == undefined)
	{
		var mode = Math.round(Math.random()*255);
		if (mode != 10 && modes[mode+''] != undefined)
			randomMode = mode + '';
	}
	return modes[randomMode](platID);
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
  	var platID = getPlat();
  	var topic = options.mqtt_username + '/' + tenant + '/' + base + '/' + platID + '/command';
  	var payload = JSON.stringify((mode == 'random') ? getRandomPayloadWithoutEEPROM(platID) : modes[mode](platID));
  	console.log(topic + ' > ' + payload);
  	client.publish(topic, payload);
  }, interval);
});

