const BusRoute = require("../models/busRouteModel");
const User = require("../models/userModel");

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

module.exports = {
  getRoutes,
  addFavoriteRoute,
  getFavoriteRoutes,
  getStopDetails,
};
