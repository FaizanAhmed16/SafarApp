const calculateDistance = require("./calculateDistance");

function findNearest(userLat, userLng, stops) {
  let nearestStop = null;
  let minDistance = Number.MAX_VALUE;

  stops.forEach((stop) => {
    const [stopLng, stopLat] = stop.location.coordinates;
    const distance = calculateDistance(userLat, userLng, stopLat, stopLng);

    if (distance < minDistance) {
      minDistance = distance;
      nearestStop = stop;
    }
  });

  return nearestStop;
}

module.exports = findNearest;
