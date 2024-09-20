const mongoose = require("mongoose");
const { mongo_connection } = require("../config/connection");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    profile_image: { type: String },
    contact_number: { type: Number },
    birth_date: { type: Date },
    reset_password_token: { type: String },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongo_connection.model("user", userSchema);
module.exports = User;
