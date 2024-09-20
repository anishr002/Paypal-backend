const router = require("express").Router();
const authRoute = require("./authRoute");

router.use("/auth", authRoute);
module.exports = router;
