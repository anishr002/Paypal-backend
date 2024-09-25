const { createClient } = require("../config/paypalConfig");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
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

// Generate client token for Braintree/PayPal transactions
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
  console.log(res, "res");
  return res?.data?.client_token;
}

// Create an order
async function createOrder() {
  const client = createClient();
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "100.00", // Replace with your amount
        },
      },
    ],
    application_context: {
      return_url: "https://your-site.com/return",
      cancel_url: "https://your-site.com/cancel",
    },
  });

  try {
    const order = await client.execute(request);
    return order.result.id;
  } catch (err) {
    throw err;
  }
}

// Capture an order
async function captureOrder(orderID) {
  const client = createClient();
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    return capture;
  } catch (err) {
    throw err;
  }
}

// Function to process a refund without platform fees
async function refundPayment(captureId, amount) {
  const accessToken = await generateToken();
  const uniqueRequestId = uuidv4();
  const uniqueInvoiceId = `INV-${Date.now()}`; // Unique invoice ID

  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": uniqueRequestId, // Ensure this ID is unique for each request
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency_code: "USD",
        },
        invoice_id: uniqueInvoiceId, // Optional
        note_to_payer: "DefectiveProduct", // Optional
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Refund failed: ${error}`);
  }

  const data = await response.json();
  return data;
}

module.exports = {
  generateToken,
  generateClientToken,
  createOrder,
  captureOrder,
  refundPayment,
};
