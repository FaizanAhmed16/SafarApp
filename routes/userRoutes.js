const express = require("express");

const {
  registerUser,
  currentUser,
  loginUser,
} = require("../controllers/userController");

const { getRoutes } = require("../controllers/routeController");

const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

router.get("/routes", getRoutes);

module.exports = router;
