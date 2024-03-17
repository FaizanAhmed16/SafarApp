const BusRoute = require("../models/busRouteModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");

const getRoutes = async (req, res) => {
  try {
    const routes = await BusRoute.find({}, "routeName stops")
      .populate("stops.stop", "name")
      .exec();

    const formattedRoutes = routes.map((route) => {
      const stops = route.stops.map((stop) => stop.stop.name);
      return `${route.routeName} --> ${stops[0]} - ${stops[stops.length - 1]}`;
    });

    res.json(formattedRoutes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addFavoriteRoute = async (req, res) => {
  const { userId, routeID } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if routeID exists in BusRoute model
    const busRoute = await BusRoute.findById(routeID);
    if (!busRoute) {
      return res.status(404).json({ message: "Bus route not found" });
    }

    // Check if routeID already exists in user's favoriteRoutes
    if (!user.favoriteRoutes.includes(routeID)) {
      user.favoriteRoutes.push(routeID);
      await user.save();
    }

    res.status(200).json({ message: "Route added to favorites successfully" });
  } catch (error) {
    console.error("Error adding favorite route:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getFavoriteRoutes = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate("favoriteRoutes");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ favoriteRoutes: user.favoriteRoutes });
  } catch (error) {
    console.error("Error getting favorite routes:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getStopDetails = async (req, res) => {
  const { routeId, stopId } = req.params;

  try {
    const route = await BusRoute.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    const stop = route.stops.find((stop) => stop.stopId.toString() === stopId);
    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    res.json(stop);
  } catch (error) {
    console.error("Error getting stop details:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const recordJourneyEvent = async (userId, stopId, event) => {
  try {
    const journey = new Journey({ userId, stopId, event });
    await journey.save();
    return true;
  } catch (error) {
    console.error("Error recording journey event:", error.message);
    throw new Error("Failed to record journey event");
  }
};

const calculateStopsTraveled = async (boardingStopId, gettingOffStopId) => {
  try {
    // Find the bus route for the stops
    const busRoute = await BusRoute.findOne({
      stops: { $elemMatch: { stopId: boardingStopId } },
    });

    // Get the indices of the boarding and getting off stops in the route
    const boardingIndex = busRoute.stops.findIndex(
      (stop) => stop.stopId.toString() === boardingStopId.toString()
    );
    const gettingOffIndex = busRoute.stops.findIndex(
      (stop) => stop.stopId.toString() === gettingOffStopId.toString()
    );

    // Calculate the number of stops traveled
    const stopsTraveled = Math.abs(gettingOffIndex - boardingIndex) + 1; // Add 1 to include both boarding and getting off stops
    return stopsTraveled;
  } catch (error) {
    console.error("Error calculating stops traveled:", error.message);
    throw new Error("Failed to calculate stops traveled");
  }
};

const calculateFare = (stopsTraveled) => {
  const baseFare = 15; // Base fare for the journey
  const perStopFare = 5; // Fare per stop
  const maxFare = 55; // Maximum fare cap

  // Calculate the fare based on the number of stops traveled
  let fare = baseFare + perStopFare * (stopsTraveled - 1); // Subtract 1 to exclude the boarding stop
  fare = Math.min(fare, maxFare); // Apply maximum fare cap
  return fare;
};

const deductFare = async (userId, fare) => {
  try {
    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user has sufficient balance
    if (user.walletBalance < fare) {
      throw new Error("Insufficient balance");
    }

    // Deduct the fare from the user's wallet balance
    user.walletBalance -= fare;

    // Save the updated user object
    await user.save();

    // Return true to indicate successful deduction
    return true;
  } catch (error) {
    console.error("Error deducting fare from wallet:", error.message);
    throw new Error("Failed to deduct fare from wallet");
  }
};

module.exports = {
  getRoutes,
  addFavoriteRoute,
  getFavoriteRoutes,
  getStopDetails,
  recordJourneyEvent,
  calculateFare,
  deductFare,
  calculateStopsTraveled,
};
