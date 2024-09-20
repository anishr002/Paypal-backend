const authRoute = require("express").Router();
const authController = require("../controllers/authController");
const validatorFunc = require("../utils/validatorFunction.helper");
const { protect } = require("../middlewares/authUserMiddleware");
const { validateUserRegistration } = require("../validators/auth.validator");
const { upload } = require("../helpers/multer");

authRoute.post(
  "/signup",
  upload.single("profile_image"),
  validateUserRegistration,
  validatorFunc,
  authController.signup
);
authRoute.post("/login", authController.login);
authRoute.post("/forgot-password", authController.forgotPassword);
authRoute.post("/reset-password", authController.resetPassword);
// authRoute.use(protect);

module.exports = authRoute;
