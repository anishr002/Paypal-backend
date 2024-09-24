const router = require("express").Router();
const authRoute = require("./authRoute");
const advancePaypalRoute = require("./paypalRoutes.js");
const paypalRoute = require("./payPalTopayPalRoutes");

router.use("/auth", authRoute);
router.use("/payment", paypalRoute);
router.use("/advance", advancePaypalRoute);

module.exports = router;
