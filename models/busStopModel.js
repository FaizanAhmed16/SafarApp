const mongoose = require("mongoose");

const busStopSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
});

const BusStop = mongoose.model("BusStop", busStopSchema);

module.exports = BusStop;
