'use strict'

const 
	options 	= require('./options.js'),
	mqtt    	= require('mqtt'),
	client  	= mqtt.connect(options.mqtt_broker, {username:options.mqtt_username, password:options.mqtt_password}),
	platserial 	= require('./platserial.js'),
	SerialPort 	= require('serialport'),
	_ 			= require("underscore"),
	serialBuf	= {}
	;



var rport = /usb|acm|^com/i;
var connections = {};
var inflightPorts = {};
var topicBaseCommand = options.mqtt_username + '/' + options.tenant + '/' + options.base + '/command';



client.on('connect', function () {
  console.log("(re)connected to " + options.mqtt_broker);
  
  //subscribe to plat/tenant/base/command for base commands
  client.subscribe(topicBaseCommand);

  //if this is a reconnect, we need to subscribe to all connected serial plats
  Object.keys(connections).forEach(function(id){
	client.subscribe(options.mqtt_username + '/' + options.tenant + '/' + options.base + '/' + id + '/command');  	
  });
});

client.on('reconnect', function () {
  console.log("MQTT reconnect Event");
});

client.on('close', function () {
  console.log("MQTT close Event");
});

client.on('offline', function () {
  console.log("MQTT offline Event");
});

client.on('error', function (error) {
  console.log("MQTT error Event");
  console.error(error);
});
 
client.on('message', function (topic, message) {

	var obj;
	try {
		obj = JSON.parse(message);
	} catch(error) {
		console.error("Unable to parse MQTT message as JSON: " + message.toString());
		console.error(error);
		return;
	}

	//command for base itself
	if (obj.base !== undefined && obj.command)
	{	
		console.log("Executing base ("+obj.base+") command: " + obj.command + ": " + JSON.stringify(obj));
		_.keys(connections).forEach(function(id){
			console.log(id);
			var port = connections[id];
			sendCommand(port, obj);
		});

		return;
	} 
	//command for individual plat
	else if (obj.plat !== undefined)
	{
		console.log("Executing plat ("+obj.plat+") command: " + obj.command + ': ' + JSON.stringify(obj));
		var port = connections[obj.plat];
		if (!port)
		{
			console.log("No active serial connection for plat " + obj.plat);
			return;
		}

		sendCommand(port, obj);
	}
});

var sendCommand = function(port, obj)
{
	if (obj.command == 'platformColor')
	{
		platserial[obj.command](port, obj.r, obj.g, obj.b);
	}
	else if (obj.command == 'platformSequenceColor')
	{
		platserial[obj.command](port, obj.r, obj.g, obj.b);
	}
	else if (obj.command == 'platformSequenceCleanupColor')
	{
		platserial[obj.command](port, obj.r, obj.g, obj.b);
	}
	else if (obj.command == 'platformFlash')
	{
		platserial[obj.command](port, obj.r, obj.g, obj.b, obj.tensOfMs);
	}	
	else if (obj.command == 'rotateColor')
	{
		platserial[obj.command](port, obj.r, obj.g, obj.b, obj.delay);
	}
	else if (obj.command == 'platformFadePixels')
	{
		platserial[obj.command](port, obj.r, obj.g, obj.b, obj.delay);
	}	
	else if (obj.command == 'platformIndividualColor')
	{
		platserial[obj.command](port, obj.triplets);
	}
	else if (obj.command == 'platformSensorReading')
	{
		platserial[obj.command](port);
	}	
	else if (obj.command == 'updateMeta')
	{
		platserial[obj.command](port,obj.id, obj.threshold, obj.brightness, obj.pixels);
	} 
	else if (obj.command == 'requestMeta')
	{
		platserial[obj.command](port);
	}	
}



var onSerialOpen = function(error) {
	if (error)
		console.log(error);

	inflightPorts[this.path] = true;

	if (options.debug)
		console.log('open -> ' + this.path);	
	
	var port = this;

	//request meta so we know which mqtt topic to subscribe to
	//then add to connections in the data event
	platserial.requestMeta(port);

};


var removeConnection = function(path) {
	
	var id = _.findKey(connections, function(port) {
		return (port.path == path);
	});

	delete connections[id];	

	console.log("Active connection size: " + _.keys(connections).length);

	//MQTT unsubscribe
	client.unsubscribe(options.mqtt_username + '/' + options.tenant + '/' + options.base + '/' + id + '/command');
}

var checkConnection = function(id, port)
{
	if (connections[id] == undefined)
	{
		connections[id] = port;
		inflightPorts[port.path] = false;
		console.log("Added plat " + id + " with serial " + port.path);
		console.log("Active connection size: " + _.keys(connections).length);

		//MQTT subscribe
		client.subscribe(options.mqtt_username + '/' + options.tenant + '/' + options.base + '/' + id + '/command');
	}
}

var onSerialData = function(data) {
	var port = this;

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
	var lastIndex = serialBuf[this.path].lastIndexOf('\n');
	if(lastIndex < (serialBuf[this.path].length-1)){
		serialBuf[this.path] = serialBuf[this.path].substr(lastIndex+1);
	}


	console.log('lastindex', lastIndex, "length", serialBuf[this.path].length);
	var obj;
	try {
		obj = JSON.parse(serialBuf[this.path]);
		delete serialBuf[this.path];
		
		if (options.debug)
			console.log(obj);	
	} catch (e) {
		return;
	}

	/*
	try 
	{
		obj = JSON.parse(data);
	} catch(error)
	{
		console.log("Data received is not valid JSON. Draining, then requesting meta again!");
		platserial.requestMeta(port);
		return; 
	}*/
	
	if (options.debug)
		console.log(obj);

	if (obj.event == 'EEPROM_UPDATE' && obj.plat != obj.plat_old)
	{
		//in case the ID was switched, we need to update our internal configuration
		//connections[obj.plat] = connections[obj.plat_old];
		delete connections[obj.plat_old];

		//MQTT unsubscribe - new plat is subscribed in checkConnection later
		client.unsubscribe(options.mqtt_username + '/' + options.tenant + '/' + options.base + '/' + obj.plat_old + '/command');
	}
	
	var id = obj.id || obj.plat;
	console.log("checking connection for id:", id);
	if (id !== undefined)
		checkConnection(id, port);

	
	var topic = options.mqtt_username + '/' + options.tenant + '/' + options.base + '/' + id + '/event';
	var payload = JSON.stringify(obj);
	console.log('Publishing ' + topic + ' -> ' + payload);
	client.publish(topic, payload);
};



var onSerialError = function(error) {
	console.log('error -> ' + this.path);
	//console.log(error);

	try {
		this.close();
	} catch (error)
	{
		removeConnection(this.path);
	}
};

var onSerialClose = function() {
	if (options.debug)
		console.log('close -> ' + this.path);

	if (inflightPorts[this.path]) {
		delete inflightPorts[this.path]
	}
	
	removeConnection(this.path);

};


var checkSerial = function() {
	SerialPort.list(function(err, ports) {
	  ports.forEach(function(port) {
	    if (port != undefined && rport.test(port.comName) && !inflightPorts[port.path]) {
			/*if (options.debug)
				console.log("FOUND: ", port.comName);
			*/
			var cons = _.values(connections);
			var con = _.find(cons, function(c) {
					return (c.path == port.comName);	
			});

			if (con === undefined)
			{
				console.log("Creating SerialPort for " + port.comName + " con: " +con);
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
  console.log('Got SIGINT. Cleaning up connections and exiting.');

  
  _.keys(connections).forEach(function(id){
	console.log(id);
	var port = connections[id];
	if (port.isOpen())
  	{
  		console.log("Closing " + port.path + ' serial port');
  		port.close();	
  	}
  	else
  	{
  		console.log("Connection " + port.path + ' not open - next()');
  	}
  });

  //unsubscribe from base commands
  client.unsubscribe(topicBaseCommand);
  

  client.end(); //mqtt is over
  process.exit(); //process dies, too
  
});


checkSerial();
