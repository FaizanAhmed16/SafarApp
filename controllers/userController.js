const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const findNearest = require("../helpers/findNearest");
const BusStop = require("../models/busStopModel");
const BusRoute = require("../models/busRouteModel");
const Payment = require("../models/paymentModel");

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered!");
  }

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password: ", hashedPassword);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  console.log(`User created ${user}`);
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
  res.json({ message: "Register the user" }).json({ accessToken });
});

//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const user = await User.findOne({ email });
  //compare password with hashedpassword
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("email or password is not valid");
  }
});

//@desc Current user info
//@route POST /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const findNearestStops = async (req, res) => {
  try {
    const userLocations = req.body.userLocations;
    const nearestStops = [];

    const stops = await BusStop.find();

    // Loop through each user location
    for (const userLocation of userLocations) {
      const userLat = userLocation.coordinates[1];
      const userLng = userLocation.coordinates[0];

      let minDistance = Infinity;
      let nearestStop = null;

      // Find the nearest stop using Haversine formula
      for (const stop of stops) {
        const stopLat = stop.location.coordinates[1];
        const stopLng = stop.location.coordinates[0];

        const R = 6371e3; // Earth radius in meters
        const φ1 = (userLat * Math.PI) / 180; // Latitude of user in radians
        const φ2 = (stopLat * Math.PI) / 180; // Latitude of stop in radians
        const Δφ = ((stopLat - userLat) * Math.PI) / 180; // Difference in latitudes
        const Δλ = ((stopLng - userLng) * Math.PI) / 180; // Difference in longitudes

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance between user and stop in meters

        if (distance < minDistance) {
          minDistance = distance;
          nearestStop = stop;
        }
      }

      if (nearestStop) {
        nearestStops.push(nearestStop);
      }
    }

    res.status(200).json(nearestStops);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding nearest stops", error: error.message });
  }
};

const findRoutesContainingStops = async (req, res) => {
  try {
    const nearestStops = req.body.nearestStops;

    // Check if nearestStops is empty before querying
    if (nearestStops.length === 0) {
      return res.status(404).json({ message: "No Routes Found" }); // Early return for empty nearestStops
    }

    const routes = await BusRoute.find({
      $and: [
        { "stops.stopName": nearestStops[0].name },
        { "stops.stopName": nearestStops[1].name },
      ],
    });

    if (routes.length > 0) {
      res.status(200).json(routes.map((route) => route.routeName));
    } else {
      res.status(404).json({ message: "No Routes Found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding routes", error: error.message });
  }
};

// const findNearestStop = asyncHandler(async (req, res) => {
//   try {
//     // Assuming userLocation is an object with latitude and longitude properties
//     const userLocation = req.body.userLocation;
//     const [userLng, userLat] = userLocation.coordinates;

//     // Find all stops and calculate distances
//     const stops = await Stop.find();
//     const nearestStop = findNearest(userLat, userLng, stops);

//     res.status(200).json(nearestStop);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error finding nearest stop", error: error.message });
//   }
// });

const addFunds = async (req, res) => {
  try {
    const { userID, amount } = req.body;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.walletBalance += amount;
    await user.save();

    res.status(200).json({ message: "Funds added successfully" });
  } catch (error) {
    console.error("Error adding funds:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getWalletBalance = async (req, res) => {
  try {
    const { userID } = req.params;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const balance = user.walletBalance;
    res.status(200).json({ balance });
  } catch (error) {
    console.error("Error retrieving wallet balance:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Creating a new payment
const createPayment = async (req, res) => {
  try {
    const {
      userID,
      amount,
      paymentMethod,
      serviceDetails,
      mobileAccountNumber,
      cardDetails,
    } = req.body;

    // Create a new payment instance
    const newPayment = new Payment({
      userID,
      amount,
      paymentMethod,
      serviceDetails,
      mobileAccountNumber,
      cardDetails, // Make sure to handle cardDetails securely
    });

    // Save the payment instance to the database
    const savedPayment = await newPayment.save();

    // Respond with the saved payment
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Updating payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentID, status } = req.body;

    // Update the payment status
    const updatedPayment = await Payment.findOneAndUpdate(
      { paymentID },
      { status },
      { new: true } // Returns the updated document
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Respond with the updated payment information
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieving a payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { paymentID } = req.params;

    // Retrieve the Payment
    const payment = await Payment.findOne({ paymentID });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Found Payment
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  findNearestStops,
  findRoutesContainingStops,
  addFunds,
  getWalletBalance,
  createPayment,
  updatePaymentStatus,
  getPaymentById,
};
