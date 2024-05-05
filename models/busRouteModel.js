const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const busRouteSchema = mongoose.Schema({
  routeID: {
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
      stopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BusStop",
        required: true,
      },
      stopName: {
        type: String,
        required: true,
      },
      // arrivalTime: {
      //   type: String,
      //   required: true,
      // },
    },
  ],
  capacity: {
    type: Number,
    default: 0,
  },
  // estimatedTime: {
  //   type: String,
  //   required: true,
  // },
});

busRouteSchema.plugin(AutoIncrement, { inc_field: "routeID" });

const BusRoute = mongoose.model("BusRoute", busRouteSchema);

module.exports = BusRoute;
