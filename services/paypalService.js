const Order = require("../models/captureOrderSchema"); // Adjust the path as needed
const { v4: uuidv4 } = require("uuid");
const { default: axios } = require("axios");

// Generate PayPal access token (client credentials)
async function generateToken() {
  const res = await axios({
    url: process.env.PAYPAL_BASE_URL + "/v1/oauth2/token",
    method: "post",
    data: "grant_type=client_credentials",
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET,
    },
  });
  return res?.data?.access_token;
}

// Generate client token for PayPal transactions
async function generateClientToken() {
  const accessToken = await generateToken();
  const res = await axios({
    url: process.env.PAYPAL_BASE_URL + "/v1/identity/generate-token",
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return res?.data?.client_token;
}

// Create an order using PayPal API
async function createOrder(purchaseUnits) {
  const accessToken = await generateToken();
  console.log(purchaseUnits, "purchaseUnits");
  const res = await axios({
    url: process.env.PAYPAL_BASE_URL + "/v2/checkout/orders",
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: {
      intent: "CAPTURE",
      purchase_units: purchaseUnits,
      application_context: {
        return_url: "https://your-site.com/return",
        cancel_url: "https://your-site.com/cancel",
      },
    },
  });

  // Save the order in MongoDB
  const newOrder = new Order({
    orderID: res.data.id,
    purchaseUnits: purchaseUnits,
    status: "Success",
  });

  await newOrder.save(); // Save to the database
  return res.data.id; // Return the order ID
}

// Capture an order using PayPal API
async function captureOrder(orderID) {
  const accessToken = await generateToken();

  const res = await axios({
    url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return res.data; // Return the capture details
}

// Function to process a refund using PayPal API
async function refundPayment(captureId, amount) {
  const accessToken = await generateToken();
  const uniqueRequestId = uuidv4();
  const uniqueInvoiceId = `INV-${Date.now()}`; // Unique invoice ID

  try {
    const response = await axios({
      method: "POST",
      url: `${process.env.PAYPAL_BASE_URL}/v2/payments/captures/${captureId}/refund`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": uniqueRequestId, // Ensure this ID is unique for each request
        Prefer: "return=representation",
      },
      data: {
        amount: {
          value: amount.toFixed(2),
          currency_code: "USD",
        },
        invoice_id: uniqueInvoiceId, // Optional
        note_to_payer: "DefectiveProduct", // Optional
      },
    });

    return response.data;
  } catch (err) {
    throw new Error(
      `Refund failed: ${err.response ? err.response.data : err.message}`
    );
  }
}

module.exports = {
  generateToken,
  generateClientToken,
  createOrder,
  captureOrder,
  refundPayment,
};
