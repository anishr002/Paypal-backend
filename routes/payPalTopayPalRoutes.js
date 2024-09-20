const { paypalToPayPal } = require("../controllers/payPalToPayPalController");

const paypalRoute = require("express").Router();

paypalRoute.get("/createpayment",paypalToPayPal);


module.exports = paypalRoute;
