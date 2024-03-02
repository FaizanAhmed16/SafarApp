const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const busRouteSchema = mongoose.Schema({
  busID: {
    type: Number,
    unique: true,
  },
  busCategory: {
    type: String,
    enum: ["Red Bus", "Green Bus", "Orange Bus"],
    required: true,
  },
  routeName: {
    type: String,
    required: true,
  },
  stops: [
    {
      stop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
        required: true,
      },
      arrivalTime: {
        type: String,
        required: true,
      },
    },
  ],
  capacity: {
    type: Number,
    default: 0,
  },
  estimatedTime: {
    type: String,
    required: true,
  },
});

autoIncrement.initialize(mongoose.connection);
busRouteSchema.plugin(autoIncrement.plugin, { model: "BusRoute", field: "busID" });

const BusRoute = mongoose.model("BusRoute", busRouteSchema);

module.exports = BusRoute;