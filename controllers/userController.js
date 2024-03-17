const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const findNearest = require("../helpers/findNearest");
const Stop = require("../models/busStopModel");

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

const findNearestStop = asyncHandler(async (req, res) => {
  try {
    // Assuming userLocation is an object with latitude and longitude properties
    const userLocation = req.body.userLocation;
    const [userLng, userLat] = userLocation.coordinates;

    // Find all stops and calculate distances
    const stops = await Stop.find();
    const nearestStop = findNearest(userLat, userLng, stops);

    res.status(200).json(nearestStop);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding nearest stop", error: error.message });
  }
});

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

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  findNearestStop,
  addFunds,
  getWalletBalance,
};
