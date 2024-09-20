const { body } = require("express-validator");
const validationMessage = require("../messages/validation.json");

exports.validateUserRegistration = [
  body("email").notEmpty().withMessage(validationMessage.general.emailRequired),
  body("password")
    .notEmpty()
    .withMessage(validationMessage.general.passwordRequired),
  body("contact_number")
    .notEmpty()
    .withMessage(validationMessage.general.contactNumberRequired),
  body("name").notEmpty().withMessage(validationMessage.general.nameRequired),
];
