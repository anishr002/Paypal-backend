const mongoose = require("mongoose");

const captureOrderSchema = new mongoose.Schema({
  captureID: String,

  status: String,
  createdAt: { type: Date, default: Date.now },
});

const CaptureOrder = mongoose.model("CaptureOrder", captureOrderSchema);

module.exports = CaptureOrder;
