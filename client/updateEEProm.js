'use strict';

const 
	options 	= require('./options.js'),
	platserial 	= require('./platserial.js'),
	SerialPort 	= require('serialport'),
	_ 			= require("underscore"),
	serialBuf	= {}
	;

var rport = /usb|acm|^com/i;
var connectionPaths = [];




var NEW_PLAT_ID = 999; 
var NEW_BRIGHTNESS = 150; // probably no need to change this
var NEW_BRIGHTNESS_TRESHOLD = 50; // probably no need to change this
var NEW_NUMBER_OF_PIXELS = 10; // change this if your neopixel ring or strip has a different number of pixels



var onSerialOpen = function(error) {
	if (error)
		console.log("error in onSerialOpen", error);

	if (options.debug)
		console.log("open device -> ", this.path);	
	
	var port = this;
	platserial.updateMeta(port, NEW_PLAT_ID, NEW_BRIGHTNESS_TRESHOLD, NEW_BRIGHTNESS, NEW_NUMBER_OF_PIXELS);
};





var onSerialData = function(data) {
	if (options.debug)
		console.log("data -> " , this.path, " -> ", data);

	if (serialBuf[this.path])
	{
		serialBuf[this.path] += data.toString();
	}
	else
	{
		serialBuf[this.path] = data.toString();
	}
	// avoid always extending the buffer
	var split = serialBuf[this.path].split('\n');
	serialBuf[this.path] = split[split.length-1];

	try {
		var obj = JSON.parse(serialBuf[this.path]);
		delete serialBuf[this.path];
		
		console.log("Please check below yourself. Everything should be the same.");
		console.log("Plat", NEW_PLAT_ID, " should match ", obj.plat, (NEW_PLAT_ID == obj.plat) ? ", they seem to match" : ", they don't seem to match");
		console.log("Brightness", NEW_BRIGHTNESS, " should match ", obj.brightness, (NEW_BRIGHTNESS == obj.brightness) ? ", they seem to match" : ", they don't seem to match");
		console.log("Threshold", NEW_BRIGHTNESS_TRESHOLD, " should match ", obj.threshold, (NEW_BRIGHTNESS_TRESHOLD == obj.threshold) ? ", they seem to match" : ", they don't seem to match");
		console.log("Number of Pixels", NEW_NUMBER_OF_PIXELS, " should match ", obj.pixels, (NEW_NUMBER_OF_PIXELS == obj.pixels) ? ", they seem to match" : ", they don't seem to match");

		console.log("Please decide if this is ok on your own!");

		console.log("Exiting...");
		process.exit();

	} catch (e) {

	}
	
	
};



var onSerialError = function(error) {
	console.error("error -> ", this.path, error);

	try {
		this.close();
	} catch (error) {}

};

var onSerialClose = function() {
	if (options.debug)
		console.log("close -> ", this.path);
};


var checkSerial = function() {
	SerialPort.list(function(err, ports) {
	  ports.forEach(function(port) {
	    if (rport.test(port.comName)) {
			if (connectionPaths.indexOf(port.comName) == -1)
			{
				console.log("Adding port -> ", port.comName, " on array index ", connectionPaths.length);
		      	connectionPaths[connectionPaths.length] = port.comName;

		      	var sp = new SerialPort(port.comName, {
	  				baudRate: 115200,
				});

				sp.on("open", onSerialOpen);
				sp.on("close", onSerialClose);
				sp.on("data", onSerialData);
				sp.on("error", onSerialError);				
			}
	    }
	  });
	
	});
	setTimeout(checkSerial, 2000);
};


process.on('SIGINT', function() {
  console.log('Got SIGINT. Exiting.');
  process.exit();
});


checkSerial();
