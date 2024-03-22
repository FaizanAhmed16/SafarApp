const express = require("express");

const {
  registerUser,
  currentUser,
  loginUser,
  findNearestStop,
  addFunds,
  getWalletBalance,
  createPayment,
  updatePaymentStatus,
  getPaymentById,
} = require("../controllers/userController");

const {
  getRoutes,
  addFavoriteRoute,
  getFavoriteRoutes,
  getStopDetails,
  recordJourneyEvent,
  calculateFare,
  calculateStopsTraveled,
  deductFare,
} = require("../controllers/routeController");

const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

router.get("/routes", getRoutes);

router.post("/users/:userId/favorite-routes", addFavoriteRoute);

router.get("/users/:userId/favorite-routes", getFavoriteRoutes);

router.get("/:routeId/stops/:stopId", getStopDetails);

router.post("/nearest-stop", findNearestStop);

router.post("/record-journey-event", recordJourneyEvent);

router.get(
  "/calculate-stops-traveled/:boardingStopId/:gettingOffStopId",
  calculateStopsTraveled
);

router.get("/calculate-fare/:stopsTraveled", calculateFare);

router.post("/add-funds", addFunds);

router.get("/wallet-balance/:userId", getWalletBalance);

router.post("/deduct-fare", deductFare);

router.post("/payment", createPayment);

router.get("/payment/:id", getPaymentById);

router.put("/payment/:id/status", updatePaymentStatus);

module.exports = router;
