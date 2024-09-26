const mongoose = require('mongoose');
const { mongo_connection } = require("../config/connection");

const cardSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // The user's ID
  brand: { type: String, required: true },  // Card brand (e.g., Visa, Mastercard)
  last4: { type: String, required: true },  // Last 4 digits of the card
  expiryMonth: { type: String, required: true }, 
  expiryYear: { type: String, required: true },
  cardToken: { type: String, required: true }, // The tokenized card ID from PayPal Vault
}, { timestamps: true });

const Card = mongo_connection.model('Card', cardSchema);
module.exports = Card;
