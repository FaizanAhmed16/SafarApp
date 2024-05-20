const BusRoute = require("../models/busRouteModel");
const User = require("../models/userModel");
const Journey = require("../models/journeyModel");

// const getRoutes = async (req, res) => {
//   try {
//     const routes = await BusRoute.find({}, "routeName stops")
//       .populate("stops.stop", "name")
//       .exec();

//     const formattedRoutes = routes.map((route) => {
//       const stops = route.stops.map((stop) => stop.stop.name);
//       return `${route.routeName} --> ${stops[0]} - ${stops[stops.length - 1]}`;
//     });

//     res.json(formattedRoutes);
//   } catch (error) {
//     console.error("Error fetching routes:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const getRoutes = async (req, res) => {
  try {
    const routes = await BusRoute.find({});
    res.send(routes);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Failed to fetch routes", error: error.message });
  }
};

const fetchRoutes = async (req, res) => {
  try {
    const routes = await BusRoute.find({}, "routeID routeName").populate(
      "stops",
      "stopId stopName"
    );
    res.json(routes);
  } catch (error) {
    console.error("Error fetching routes:", error); // Added logging
    res
      .status(500)
      .send({ message: "Failed to fetch routes", error: error.message });
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

const getRouteDetailsByName = async (req, res) => {
  const { routeName } = req.params;
  try {
    const route = await BusRoute.findOne({ routeName }).populate(
      "stops.stopId"
    );
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }
    res.json(route);
  } catch (error) {
    console.error("Error getting route details by name:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getFirstAndLastStopCoordinates = async (req, res) => {
  const { routeId } = req.params;

  try {
    const route = await BusRoute.findById(routeId)
      .populate("stops.stopId") // Ensure that BusStop data is loaded
      .exec();

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    const stops = route.stops;
    if (stops.length < 2) {
      return res.status(400).json({
        message:
          "Insufficient stops on the route to determine first and last stop.",
      });
    }

    // Extract the first and last stop
    const firstStop = stops[0].stopId;
    const lastStop = stops[stops.length - 1].stopId;

    // If stopId populating fails, it could lead to undefined values here; handle gracefully
    if (!firstStop || !lastStop) {
      return res
        .status(500)
        .json({ message: "Failed to retrieve stops details." });
    }

    // Constructing response with coordinates
    const coordinates = {
      firstStop: {
        name: firstStop.name,
        coordinates: firstStop.location.coordinates,
      },
      lastStop: {
        name: lastStop.name,
        coordinates: lastStop.location.coordinates,
      },
    };

    res.json(coordinates);
  } catch (error) {
    console.error("Error retrieving first and last stop coordinates:", error);
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

const calculateStopsTraveled = async (
  routeId,
  boardingStopId,
  gettingOffStopId
) => {
  try {
    // Find the bus route using routeId
    const busRoute = await BusRoute.findOne({ routeID: routeId });

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

const calculateFare = (stopsTraveled, numberOfTickets) => {
  const baseFare = 15; // Base fare for the journey
  const perStopFare = 5; // Fare per stop
  const maxFare = 55; // Maximum fare cap

  // Calculate the fare based only on the number of stops minus one to exclude the boarding stop
  let fare = perStopFare * (stopsTraveled - 1);

  // Apply constraints based on baseFare and maxFare
  if (fare > maxFare) {
    fare = maxFare;
  } else if (fare < baseFare) {
    fare = baseFare;
  }

  return fare * numberOfTickets;
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
  fetchRoutes,
  addFavoriteRoute,
  getFavoriteRoutes,
  getStopDetails,
  recordJourneyEvent,
  calculateFare,
  deductFare,
  calculateStopsTraveled,
  getFirstAndLastStopCoordinates,
  getRouteDetailsByName,
};
