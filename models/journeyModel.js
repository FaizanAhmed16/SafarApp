const mongoose = require("mongoose");

const journeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BusStop",
    required: true,
  },
  event: { type: String, enum: ["boarding", "gettingOff"], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Journey", journeySchema);
