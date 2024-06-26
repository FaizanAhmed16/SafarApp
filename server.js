const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

connectDb();

const app = express();

const port = process.env.PORT;

app.use(express.json());

app.use(cors());

app.use("/users", userRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
