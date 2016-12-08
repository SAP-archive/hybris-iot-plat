
function platformColor(port,r,g,b) {
  var buffer = new Buffer([0,r,g,b]);
    
    port.write(buffer, function(err, results){
      if (err)
        console.log(err);
    });
}

function platformSequenceColor(port,r,g,b) {
  var buffer = new Buffer([1,r,g,b]);
    
    port.write(buffer, function(err, results){
      if (err)
        console.log(err);
    });
} 

function platformSequenceCleanupColor(port,r,g,b) {
  var buffer = new Buffer([2,r,g,b]);
    
    port.write(buffer, function(err, results){
      if (err)
        console.log(err);
    }); 
}

function platformFlash(port,r,g,b, tensOfMs) {
  var buffer = new Buffer([5,r,g,b,tensOfMs]);
    
    port.write(buffer, function(err, results){
      if (err)
        console.log(err);
    }); 
}

function rotateColor(port,r,g,b, delay) {
  var buffer = new Buffer([6,r,g,b,delay]);
    
    port.write(buffer, function(err, results){
      if (err)
        console.log(err);
    }); 
}

function platformFadePixels(port,r,g,b, delay) {
  var buffer = new Buffer([7,r,g,b,delay]);
    
    port.write(buffer, function(err, results){
      if (err)
        console.log(err);
    }); 
}


function platformIndividualColor(port, triplets) {
  
  var content = [3];
  triplets.forEach(function(triplet) {
    content = content.concat(triplet);
  });

  //console.log(content);
    
    port.write(new Buffer(content), function(err, results){
      if (err)
        console.log(err);
    });
}

function platformSensorReading(port) {
  var buffer = new Buffer([4]);
    
    port.write(buffer, function(err, results){
      if (err)
        console.log(err);
    }); 
}

function updateMeta(port,id, threshold, brightness, pixels) {
  // 10|id|id|id|id|tr|tr|b|p

  // maximum 16777215 right now
  var id_8 = id & 0xFF;
  var id_16 = (id >> 8) & 0xFF;
  var id_24 = (id >> 16 ) & 0xFF;
  var id_32 = 0; // might also be filled, but there are problems with JS and signed ints

  // maximum 65535, real maximum is 1024 (10 bit)
  var threshold_8 = threshold & 0xFF;
  var threshold_16 = (threshold >> 8) & 0xFF;

  var buffer = new Buffer([10, id_8, id_16, id_24, id_32, threshold_8, threshold_16, brightness, pixels]);
    
    console.log(buffer);
    port.write(buffer, function(err, results){
      if (err)
        console.log(err);
    }); 
}

function requestMeta(port) {
  var buffer = new Buffer([11]);
    
    port.write(buffer, function(err, results){
      if (err)
        console.log(err);
    }); 
}




module.exports = {
  platformIndividualColor : platformIndividualColor,
  platformColor : platformColor,
  platformSequenceColor : platformSequenceColor,
  platformSequenceCleanupColor : platformSequenceCleanupColor,
  platformFlash : platformFlash,
  platformFadePixels : platformFadePixels,
  rotateColor : rotateColor,
  updateMeta : updateMeta,
  requestMeta : requestMeta,
  platformSensorReading : platformSensorReading
}