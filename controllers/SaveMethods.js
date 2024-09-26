//save methods with paypal sdk
const express = require('express');
const paypal = require('paypal-rest-sdk');
const { sendResponse } = require('../utils/sendResponse');
const catchAsyncError = require('../helpers/catchAsyncError');
const { default: axios } = require('axios');
const app = express();

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret':process.env.PAYPAL_SECRET
  });
  //create order with javascript sdk
  exports.paypalcreateorderSDK = catchAsyncError(async (req, response, next) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "transactions": [{
          "amount": {
            "currency": "USD",
            "total": "100.00"
          },
          "description": "Payment description"
        }],
        "redirect_urls": {
          "return_url": "http://localhost:3000/returnUrl",
          "cancel_url": "http://localhost:3000/cancelUrl"
        }
      };
    
      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
          console.log(error);
          //res.status(500).send(error);
          sendResponse(response, false, 'Error while payment execute', error, 400);  
        } else {
            sendResponse(response, true, 'done save', payment, 400);  
          //res.send(payment);
        }
      });
  })

//get acess token
  async function genrateToken() {
    const res = await axios({
      url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
      method: 'post',
      data: 'grant_type=client_credentials',
      auth: {
        username: process.env.PAYPAL_CLIENT_ID ,
        password: process.env.PAYPAL_SECRET,
      },
    });
    return res?.data?.access_token;
  }

  exports.paypalsavemethods = catchAsyncError(async (req, response, next) => {
    const { billingToken } = req.body;
    const accessToken = await genrateToken();

    const agreementData = {
      "name": "Direct Payment Recurring Profile",
      "description": "Recurring payment for subscription",
      "start_date": new Date(Date.now() + 1000 * 60 * 5).toISOString(), // Start in 5 minutes
      "payer": {
        "payment_method": "paypal",
      },
      "plan": {
        "id": 'P-4VD67529EY827261EM3Z6EAY' // Billing Token or Plan ID
      }
    };
  
    try {
      const response = await axios({
        url: 'https://api-m.sandbox.paypal.com/v1/payments/billing-agreements',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer' + ' ' + accessToken,
        },
        data: agreementData,
      });
   
      sendResponse(response, true, 'Payment method saved successfully', response.data, 200);
     // return response.data;
    } catch (error) {
        return sendResponse(response, false, 'Error saving payment method', error || error, 400);
    }
  

//   // Create the billing agreement
//   paypal.billingAgreement.create(agreement_data, function (error, billingAgreement) {
//     if (error) {
//       console.error('Error saving payment method:', error);
//       return sendResponse(response, false, 'Error saving payment method', error.response || error, 400);
//     } else {
//       // Save the billingAgreement ID for future payments
//       console.log('Billing Agreement saved:', billingAgreement);
//       sendResponse(response, true, 'Payment method saved successfully', billingAgreement, 200);
//     }
//   });
   });


// Endpoint to cancel the subscription and issue a refund
exports.cancelSubscriptionAndRefund = catchAsyncError(async (req, response, next) => {
    const { subscriptionId, paymentId } = req.body; // paymentId is the transaction ID for the refund
  
    if (!subscriptionId || !paymentId) {
      return sendResponse(response, false, 'Subscription ID and Payment ID are required', null, 400);
    }
  
    // Cancel the subscription
    const cancelUrl = `https://api.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`;
  
    const cancelData = {
      "reason": "User requested cancellation" // Optional: provide a reason
    };
  
    // Cancel subscription
    try {
      await paypal.request({
        url: cancelUrl,
        method: 'POST',
        body: cancelData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}` // Use an access token
        }
      });
  
      console.log('Subscription cancelled:', subscriptionId);
  
      // Issue a refund
      const refundUrl = `https://api.sandbox.paypal.com/v1/payments/sale/${paymentId}/refund`;
  
      const refundData = {
        "amount": {
          "total": "10.00", // Replace with the amount you want to refund
          "currency": "USD"
        },
        "reason": "User requested refund" // Optional: provide a reason
      };
  
      const refundResponse = await paypal.request({
        url: refundUrl,
        method: 'POST',
        body: refundData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}` // Use an access token
        }
      });
  
      console.log('Refund issued:', refundResponse);
      return sendResponse(response, true, 'Subscription cancelled and refund issued successfully', refundResponse, 200);
    } catch (error) {
      console.error('Error:', error);
      return sendResponse(response, false, 'Error processing request', error, 500);
    }
  });

