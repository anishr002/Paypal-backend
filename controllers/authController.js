const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const AuthService = require("../services/authService");
const { sendResponse } = require("../utils/sendResponse");
const authService = new AuthService();

// User Sign Up
exports.signup = catchAsyncError(async (req, res, next) => {
  const user = await authService.signUp(req?.body, req?.file);
  sendResponse(
    res,
    true,
    returnMessage("auth", "registered"),
    user,
    statusCode.success
  );
});

// User Log In
exports.login = catchAsyncError(async (req, res, next) => {
  const user = await authService.logIn(req?.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    user,
    statusCode.success
  );
});

// User Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  await authService.forgotPassword(req?.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "resetPasswordMailSent"),
    null,
    statusCode.success
  );
});

// User Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  await authService.resetPassword(req?.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "resetPassword"),
    null,
    statusCode.success
  );
});
