const router = require("express").Router();
const authRoute = require("./authRoute");
const paypalRoute = require("./payPalTopayPalRoutes");
const saveCradRoute = require("./savecardroutes");

router.use("/auth", authRoute);
router.use("/payment",paypalRoute)
router.use("/cardMethod",saveCradRoute)
module.exports = router;
