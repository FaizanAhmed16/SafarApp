const express = require("express");

const {
  registerUser,
  currentUser,
  loginUser,
} = require("../controllers/userController");

const {
  getRoutes,
  addFavoriteRoute,
  getFavoriteRoutes,
  getStopDetails,
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

module.exports = router;
