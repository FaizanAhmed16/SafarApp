const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const paymentSchema = mongoose.Schema({
  paymentID: {
    type: Number,
    unique: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["SAFAR Wallet", "JazzCash", "EasyPaisa", "Credit/Debit Card"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Initiated", "Pending", "Completed", "Failed"],
    default: "Initiated",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  transactionID: {
    type: String,
    unique: true,
  },
  cardDetails: {
    cardNumber: {
      type: String,
      required: function () {
        return this.paymentMethod === "Credit/Debit Card";
      },
    },
    cardHolderName: {
      type: String,
      required: function () {
        return this.paymentMethod === "Credit/Debit Card";
      },
    },
    expiryDate: {
      type: String,
      required: function () {
        return this.paymentMethod === "Credit/Debit Card";
      },
    },
  },
  // JazzCash or EasyPaisa
  mobileAccountNumber: {
    type: String,
    required: function () {
      return (
        this.paymentMethod === "JazzCash" || this.paymentMethod === "EasyPaisa"
      );
    },
  },
  serviceDetails: {
    routeID: {
      type: Number,
      ref: "BusRoute",
    },
    serviceName: {
      type: String,
    },
  },
});

paymentSchema.plugin(AutoIncrement, { inc_field: "paymentID" });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
