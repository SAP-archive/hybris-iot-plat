
function platformColor(plat,r,g,b) {
  return {"plat":plat, "command":arguments.callee.name, "r":r,"g":g, "b":b};
}

function platformSequenceColor(plat,r,g,b) {
  return {"plat":plat, "command":arguments.callee.name, "r":r,"g":g, "b":b};	
} 

function platformSequenceCleanupColor(plat,r,g,b) {
	return {"plat":plat, "command":arguments.callee.name, "r":r,"g":g, "b":b}; 	
}

function platformFlash(plat,r,g,b,tensOfMs) {
	return {"plat":plat, "command":arguments.callee.name, "r":r,"g":g, "b":b, "tensOfMs":tensOfMs}; 	
}

function platformFadePixels(plat,r,g,b,delay) {
	return {"plat":plat, "command":arguments.callee.name, "r":r,"g":g, "b":b, "delay":delay}; 	
}

function rotateColor(plat,r,g,b,delay) {
	return {"plat":plat, "command":arguments.callee.name, "r":r,"g":g, "b":b, "delay":delay}; 	
}


function platformIndividualColor(plat,triplets) {
  return {"plat":plat, "command":arguments.callee.name, triplets:triplets};
}

function platformSensorReading(plat) {
 return {"plat":plat, "command":arguments.callee.name}; 
}

function updateMeta(plat,id, threshold, brightness, pixels) {
  return {"plat":plat, "command":arguments.callee.name, "id":id,"threshold":threshold, "brightness":brightness, "pixels":pixels};
}

function requestMeta(plat) {
 return {"plat":plat, "command":arguments.callee.name}; 
}


module.exports = {
	platformIndividualColor : platformIndividualColor,
	platformColor : platformColor,
	platformSequenceColor : platformSequenceColor,
	platformSequenceCleanupColor : platformSequenceCleanupColor,
	platformFlash : platformFlash,
	rotateColor : rotateColor,
	updateMeta : updateMeta,
	requestMeta : requestMeta,
	platformSensorReading : platformSensorReading,
	platformFadePixels : platformFadePixels
}