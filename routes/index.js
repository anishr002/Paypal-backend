const router = require("express").Router();
const authRoute = require("./authRoute");
const paypalRoute = require("./payPalTopayPalRoutes");

router.use("/auth", authRoute);
router.use("/payment",paypalRoute)
module.exports = router;
