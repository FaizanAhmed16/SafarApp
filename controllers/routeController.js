const BusRoute = require("../models/busRouteModel");

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

module.exports = { getRoutes };
