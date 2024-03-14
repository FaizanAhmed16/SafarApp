const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(
      "Database connected: ",
      connect.connection.host,
      connect.connection.name
    );
    return connect;
  } catch (err) {
    console.log("Error connecting to database:", err.message);
    throw err;
  }
};

module.exports = connectDb;
