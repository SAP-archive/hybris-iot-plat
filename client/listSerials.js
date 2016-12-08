var SerialPort = require("serialport");
var rport = /usb|acm|^com/i;


var listSerials = function() {
	console.log("--- --- --- --- --- ---");
	var total = 0;
	SerialPort.list(function(err, ports) {
	  ports.forEach(function(port) {
	    if (rport.test(port.comName)) {
			total++;
	      	console.log("FOUND: ", port.comName);
	    }
	  });
	  console.log("Total USB devices found: " + total);
	  console.log("--- --- --- --- --- ---");
	});
	setTimeout(listSerials, 5000);
};


listSerials();