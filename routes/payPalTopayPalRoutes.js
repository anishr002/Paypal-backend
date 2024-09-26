const { paypalToPayPal, capturePaymen } = require("../controllers/payPalToPayPalController");
const { paypalcreateorderSDK, paypalsavemethods, cancelSubscriptionAndRefund } = require("../controllers/SaveMethods");

const paypalRoute = require("express").Router();

paypalRoute.get("/createpayment",paypalToPayPal);
// Route to capture payment
paypalRoute.get('/capture/:orderId',capturePaymen);

paypalRoute.post('/create-payment',paypalcreateorderSDK)
paypalRoute.post('/execute-payment',paypalsavemethods)
paypalRoute.post('/cancelSubscriptionAndRefund',cancelSubscriptionAndRefund)
module.exports = paypalRoute;
