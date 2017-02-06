'use strict'

const 
	options 	= require('./options.js'),
	platserial 	= require('./platserial.js'),
	SerialPort 	= require('serialport'),
	_ 			= require("underscore"),
	serialBuf	= {}
	;



var rport = /usb|acm|^com/i;
var connectionPaths = [];
var id = 102; //change this to the first ID you want to have assigned once a platform is connected


var onSerialOpen = function(error) {
	if (error)
		console.log(error);

	if (options.debug)
		console.log('open -> ' + this.path);	
	
	var port = this;

	//port/id/threshold/brightness/pixels
	platserial.updateMeta(port, id++, 50, 150, 10); //cool for setting ids
};





var onSerialData = function(data) {
	if (options.debug)
		console.log('data -> ' + this.path + ' -> ' + data);

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
		
		if (options.debug)
			console.log(obj);	
	} catch (e) {

	}
	
	
};



var onSerialError = function(error) {
	console.log('error -> ' + this.path);
	console.log(error);

	try {
		this.close();
	} catch (error)
	{
		
	}
};

var onSerialClose = function() {
	if (options.debug)
		console.log('close -> ' + this.path);
};


var checkSerial = function() {
	SerialPort.list(function(err, ports) {
	  ports.forEach(function(port) {
	    if (rport.test(port.comName)) {
			if (connectionPaths.indexOf(port.comName) == -1)
			{
				console.log("Port: " + port.comName);
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
