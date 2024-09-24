const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// Create an environment
function createEnvironment() {
  return new checkoutNodeJssdk.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID, // Your PayPal client ID
    process.env.PAYPAL_SECRET // Your PayPal client secret
  );
}

// Returns PayPal HTTP client instance
function createClient() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(createEnvironment());
}

module.exports = { createClient };
