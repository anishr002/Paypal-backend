const { paypalToPayPal, capturePaymen } = require("../controllers/payPalToPayPalController");

const paypalRoute = require("express").Router();

paypalRoute.get("/createpayment",paypalToPayPal);
// Route to capture payment
paypalRoute.get('/capture/:orderId',capturePaymen);


module.exports = paypalRoute;
