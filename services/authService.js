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

class UserService {
  tokenGenerator = (payload) => {
    try {
      const expiresIn = payload?.remember_me
        ? process.env.JWT_REMEMBER_EXPIRE
        : process.env.JWT_EXPIRES_IN;
      const token = jwt.sign(
        { id: payload._id },
        process.env.JWT_User_SECRET_KEY,
        {
          expiresIn,
        }
      );
      return { token, user: payload };
    } catch (error) {
      logger.error(`Error while token generate, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // User Sign up
  signUp = async (payload, image) => {
    try {
      const { email, password, birth_date, name } = payload;

      if (!validateEmail(email)) {
        return throwError(returnMessage("auth", "invalidEmail"));
      }

      if (!passwordValidation(password)) {
        return throwError(returnMessage("auth", "invalidPassword"));
      }

      const user = await User.findOne({ email: email });

      if (user) {
        return throwError(returnMessage("auth", "emailExist"));
      }

      const hash_password = await bcrypt.hash(password, 10);
      let imagePath = "";
      if (image) {
        imagePath = "uploads/" + image.filename;
      }

      const formated_date = moment(birth_date);
      console.log(formated_date);
      let newUser = await User.create({
        email,
        password: hash_password,
        name,
        ...(formated_date && { birth_date: formated_date }),
        ...(imagePath && { profile_image: imagePath }),
      });
      newUser.save();

      return;
    } catch (error) {
      logger.error(`Error while user signup: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Login User
  logIn = async (payload) => {
    try {
      const { email, password, remember_me } = payload;

      if (!validateEmail(email)) {
        return throwError(returnMessage("auth", "invalidEmail"));
      }

      if (!passwordValidation(password)) {
        return throwError(returnMessage("auth", "invalidPassword"));
      }

      if (!email || !password)
        return throwError(
          returnMessage("auth", "emailPassNotFound"),
          statusCode.badRequest
        );

      const user_exist = await User.findOne({
        email,
        is_deleted: false,
      }).lean();
      if (!user_exist)
        return throwError(
          returnMessage("auth", "userNotFound"),
          statusCode.notFound
        );

      const correct_password = await bcrypt.compare(
        password,
        user_exist?.password
      );
      if (!correct_password)
        return throwError(returnMessage("auth", "incorrectPassword"));

      const { is_deleted, ...other_data } = user_exist;

      return this.tokenGenerator({ ...other_data, remember_me });
    } catch (error) {
      logger.error(`Error while user Login: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // User Forgot Password
  forgotPassword = async (payload) => {
    try {
      const { email } = payload;

      if (!validateEmail(email)) {
        return throwError(returnMessage("auth", "invalidEmail"));
      }

      const user = await User.findOne({ email: email }, { password: 0 });
      if (!user) {
        return throwError(returnMessage("auth", "invalidEmail"));
      }
      const reset_password_token = crypto.randomBytes(32).toString("hex");
      const encode = encodeURIComponent(email);
      const link = `${process.env.REACT_APP_URL}/reset-password?token=${reset_password_token}&email=${encode}`;
      const forgot_email_template = forgotPasswordEmailTemplate(
        link,
        user?.name
      );

      await sendEmail({
        email: email,
        subject: returnMessage("emailTemplate", "forgotPasswordSubject"),
        message: forgot_email_template,
      });

      const hash_token = crypto
        .createHash("sha256")
        .update(reset_password_token)
        .digest("hex");
      user.reset_password_token = hash_token;
      await user.save();
      return;
    } catch (error) {
      logger.error(`Error while user forgot password, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // User Reset Password

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

module.exports = UserService;
