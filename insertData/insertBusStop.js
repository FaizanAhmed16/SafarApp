const mongoose = require("mongoose");
const BusStop = require("../models/busStopModel"); // Assuming your model is in a file named BusStop.js

require("dotenv").config();

// Replace with your actual MongoDB connection string
const mongoURI = process.env.CONNECTINGSTRING
  "mongodb+srv://admin:admin@myclass.iyagwdi.mongodb.net/SafarDB?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

async function createBusStop(name, coordinates) {
  const busStop = new BusStop({ name, location: { coordinates } });
  await busStop.save();
  console.log("Bus stop created successfully:", busStop);
}

(async () => {
  try {
    await createBusStop(
      "Patel Para / Gurumandar",
      [24.8812898915015, 67.03812058319414]
    );
  } catch (error) {
    console.error("Error creating bus stop:", error);
  } finally {
    // Close the connection to avoid hanging processes (optional)
    await mongoose.connection.close();
  }
})();
