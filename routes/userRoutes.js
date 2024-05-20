const express = require("express");

const {
  registerUser,
  registerUserWithGoogle,
  currentUser,
  loginUser,
  getUserDetails,
  findNearestStops,
  findRoutesContainingStops,
  addFunds,
  getWalletBalance,
  createPayment,
  updatePaymentStatus,
  getPaymentById,
  createPaymentIntent,
} = require("../controllers/userController");

const {
  getRoutes,
  fetchRoutes,
  addFavoriteRoute,
  getFavoriteRoutes,
  getStopDetails,
  recordJourneyEvent,
  calculateFare,
  calculateStopsTraveled,
  deductFare,
  getFirstAndLastStopCoordinates,
  getRouteDetailsByName,
} = require("../controllers/routeController");

const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);

router.post("/register-google", registerUserWithGoogle);

router.post("/login", loginUser);

router.get("/:userId", getUserDetails);

// router.get("/current", validateToken, currentUser);

router.get("/routes/get", getRoutes);

router.get("/fetch-routes/get", fetchRoutes);

router.post("/users/:userId/favorite-routes", addFavoriteRoute);

router.get("/users/:userId/favorite-routes", getFavoriteRoutes);

router.get("/:routeId/stops/:stopId", getStopDetails);

// router.get("/routes/:routeId/coordinates", getFirstAndLastStopCoordinates);

router.get("/:routeId/coordinates", getFirstAndLastStopCoordinates);

// router.get("/routes/by-name/:routeName", getRouteDetailsByName);

router.get("/by-name/:routeName", getRouteDetailsByName);

router.post("/find-nearest-stops", findNearestStops);

router.post("/find-routes", findRoutesContainingStops);

router.post("/record-journey-event", recordJourneyEvent);

router.post("/calculate-stops-traveled", async (req, res) => {
  try {
    const { routeId, boardingStopId, gettingOffStopId } = req.body;
    const stopsTraveled = await calculateStopsTraveled(
      routeId,
      boardingStopId,
      gettingOffStopId
    );
    if (stopsTraveled == null) {
      throw new Error(
        "Calculation returned null, check inputs and data integrity"
      );
    }
    res.json({ stopsTraveled: stopsTraveled });
  } catch (error) {
    console.error("Error calculating stops traveled:", error);
    res.status(500).json({
      error: "Failed to calculate stops traveled",
      details: error.message,
    });
  }
});

router.get("/calculate-fare/:stopsTraveled/:numberOfTickets", (req, res) => {
  const { stopsTraveled, numberOfTickets } = req.params;
  try {
    const fare = calculateFare(
      parseInt(stopsTraveled, 10),
      parseInt(numberOfTickets, 10)
    );
    res.json({ fare });
  } catch (error) {
    console.error("Error calculating fare:", error.message);
    res.status(500).json({ error: "Failed to calculate fare" });
  }
});

router.post("/add-funds", addFunds);

router.get("/wallet-balance/:userId", getWalletBalance);

router.post("/deduct-fare", deductFare);

router.post("/payment", createPayment);

router.get("/payment/:id", getPaymentById);

router.put("/payment/:id/status", updatePaymentStatus);

router.post("/create-payment-intent", createPaymentIntent);

module.exports = router;
