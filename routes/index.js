const router = require("express").Router();
const authRoute = require("./authRoute");
const advancePaypalRoute = require("./paypalRoutes.js");
const paypalRoute = require("./payPalTopayPalRoutes");
const saveCradRoute = require("./savecardroutes");

router.use("/auth", authRoute);
router.use("/payment", paypalRoute);
router.use("/advance", advancePaypalRoute);
router.use("/cardMethod", saveCradRoute);
module.exports = router;
