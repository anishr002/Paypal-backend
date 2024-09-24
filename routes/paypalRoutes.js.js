const {
  paypalToPayPal,
  capturePaymen,
} = require("../controllers/payPalToPayPalController");
const paypalController = require("../controllers/paypalController");

const advancePaypalRoute = require("express").Router();

advancePaypalRoute.post("/create-order", paypalController.createOrder);
// Route to capture payment
advancePaypalRoute.post("/capture-order", paypalController.captureOrder);

advancePaypalRoute.get(
  "/generate-client-token",
  paypalController.generateClientToken
);

module.exports = advancePaypalRoute;
