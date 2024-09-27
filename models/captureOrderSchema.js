// models/Order.js
const mongoose = require("mongoose");
const { mongo_connection } = require("../config/connection");

const OrderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
  },
  purchaseUnits: {
    type: Array, // Use appropriate type based on your data
    required: true,
  },
  status: {
    type: String,
    default: "Success", // Default status can be PENDING
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongo_connection.model("Order", OrderSchema);
