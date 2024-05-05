const mongoose = require("mongoose");
const BusRoute = require("../models/busRouteModel"); // Assuming your model is in a file named busRouteModel.js
const BusStop = require("../models/busStopModel"); // Assuming your model is in a file named busStopModel.js
require("dotenv").config();

// MongoDB connection string
const mongoURI =
  "mongodb+srv://admin:admin@myclass.iyagwdi.mongodb.net/SafarDB?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

const stopData = [
  "Abdullah Chowk",
  "KDA Chowrangi",
  "Karimi Chowrangi",
  "Surjani Chowrangi",
  "2 Minute Chowrangi",
  "Road 2400",
  "Power House Chowrangi",
  "Saleem Center",
  "UP More",
  "Nagan Chowrangi",
  "Erum Shopping Emporium",
  "Jummah Bazaar",
  "Five Star Chowrangi",
  "Hyderi Market",
  "Board Office",
  "Annu Bhai Park",
  "Model Park",
  "Enquiry Office",
  "Nazimabad No 1",
  "Sanitary Market",
  "Lasbela Chowk",
  "Patel Para / Gurumandar",
  "Numaish",
];

async function updateBusRoute(routeName, stopNames) {
  const stopIds = await Promise.all(
    stopNames.map(async (name) => {
      const stop = await BusStop.findOne({ name: name });
      return { stopId: stop._id, stopName: stop.name };
    })
  );

  let busRoute = await BusRoute.findOne({ routeName });
  if (!busRoute) {
    busRoute = new BusRoute({
      busCategory: "Green Bus", // Assuming a category; update as necessary
      routeName: "KB-GL",
      stops: stopIds,
      capacity: 50, // Assuming a capacity; update as necessary
    });
  } else {
    busRoute.stops = stopIds;
  }
  await busRoute.save();
  console.log("Bus route updated successfully:", busRoute);
}

(async () => {
  try {
    await updateBusRoute("KB-GL", stopData);
  } catch (error) {
    console.error("Error updating bus route:", error);
  } finally {
    await mongoose.connection.close();
  }
})();
