const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  validateEmail,
  passwordValidation,
  verifyUser,
  forgotPasswordEmailTemplate,
} = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");
const moment = require("moment");

class PaypalTopaypalService {
  // User Sign up
  resetPassword = async (payload) => {
    try {
      const { token, email, new_password } = payload;
      if (!passwordValidation(new_password)) {
        return throwError(returnMessage("auth", "invalidPassword"));
      }

      const hash_token = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        email: email,
        reset_password_token: hash_token,
        is_deleted: false,
      });

      if (!user) {
        return throwError(returnMessage("auth", "invalidToken"));
      }

      const hash_password = await bcrypt.hash(new_password, 14);
      user.password = hash_password;
      user.reset_password_token = null;
      await user.save();
      return;
    } catch (error) {
      logger.error(`Error while User resetPassword, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = PaypalTopaypalService;
