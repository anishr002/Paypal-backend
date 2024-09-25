const {
  paypalToPayPal,
  capturePaymen,
} = require("../controllers/payPalToPayPalController");
const paypalController = require("../controllers/paypalController");
const { cancelSubscription } = require("../controllers/subscriptionController");

const advancePaypalRoute = require("express").Router();

advancePaypalRoute.post("/create-order", paypalController.createOrder);
// Route to capture payment
advancePaypalRoute.post("/capture-order", paypalController.captureOrder);

advancePaypalRoute.get(
  "/generate-client-token",
  paypalController.generateClientToken
);

advancePaypalRoute.post("/cancel", cancelSubscription);

module.exports = advancePaypalRoute;
