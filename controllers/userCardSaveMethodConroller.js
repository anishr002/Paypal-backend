const express = require('express');
const paypal = require('paypal-rest-sdk');
const { sendResponse } = require('../utils/sendResponse');
const catchAsyncError = require('../helpers/catchAsyncError');
const { default: axios } = require('axios');
const Card = require('../models/CardSchema');
const app = express();

//get paypal token
async function getPayPalAccessToken() {
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

//save user card details to paypal and our db
exports.userCardsave = catchAsyncError(async (req, res, next) => {
    const { number, type, expireMonth, expireYear, cvv, firstName, lastName } = req.body;
    const userId = 1;  // Assuming user ID is retrieved from the authentication middleware

    // Prepare card data for PayPal Vault API
    const cardData = {
        number: number,
        type: type, // Card type (Visa, Mastercard, etc.)
        expire_month: expireMonth,
        expire_year: expireYear,
        cvv2: cvv,
        first_name: firstName,
        last_name: lastName,
    };

    try {
        // Step 1: Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Step 2: Call PayPal Vault API to store the card
        const response = await axios({
            url: 'https://api-m.sandbox.paypal.com/v1/vault/credit-cards',//give by paypal 
            method: 'post',
            headers: {
                Authorization: 'Bearer' + ' ' + accessToken,
                'Content-Type': 'application/json'
            },
            data: cardData
        });

        console.log(response,'card response')

        // Step 3: Save card details in your database
        const newCard = new Card({
            userId: userId,
            brand: type,
            last4: number.slice(-4),
            expiryMonth: expireMonth,
            expiryYear: expireYear,
            cardToken: response.data.id // Store PayPal's tokenized card ID
        });

        await newCard.save();

        // Step 4: Return success response
        sendResponse(res, true, 'Card stored successfully','', 200);
        //res.json({ success: true, message: 'Card stored successfully' });
    } catch (error) {
        console.error('Error storing card:', error);
        sendResponse(res, false, error.message,error, 500);
        //res.status(500).json({ success: false, error: error.message });
    }
});
//get user card by id list api
exports.getUsercardByid = catchAsyncError(async (req, response, next) => {
    const userId = 1; // Retrieve the user ID from the token/session

    try {
        const userCards = await Card.find({ userId: userId });
        sendResponse(response, true, 'Card get successfully',userCards, 200);
        //res.json(userCards);  // Return stored card details for the user
    } catch (error) {
        sendResponse(response, true, 'error while feaching user card',error, 400);
        //res.status(500).json({ error: 'Failed to retrieve stored cards' });
    }
});


//make payment with v1 api 
exports.makepaymentwithsaveCard = catchAsyncError(async (req, response, next) => {
    console.log('come')
    const { cardId, amount } = req.body;
    const userId = 1; // Example userId, replace as needed

    try {
        // Step 1: Retrieve the card from the database to verify ownership
        const card = await Card.findOne({ _id: cardId, userId: userId });
        if (!card) {
            sendResponse(response, false, 'Card not found for this user', '', 404);
            return;
        }

        console.log(card.cardToken,'card token')

        // Step 2: Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Step 3: Create the payment request
        const paymentRequest = {
            intent: "sale",
            payer: {
                payment_method: "credit_card",
                funding_instruments: [{
                    credit_card_token: {
                        credit_card_id: card.cardToken // Use stored vaulted card token
                    }
                }]
            },
            transactions: [{
                amount: {
                    "currency": "USD",
            "total": "100.00"
                },
                description: "Payment using stored card",
                payee: {
                    email: "merchant-email@example.com"  // Specify the merchant's email or merchant ID
                }
            }]

        };

        // Step 4: Make the payment request to PayPal API
        const result = await axios({
            url: 'https://api-m.sandbox.paypal.com/v1/payments/payment',
            method: 'post',
            headers: {
                Authorization: 'Bearer' + ' ' + accessToken,
                'Content-Type': 'application/json'
            },
            data: paymentRequest
        });

        console.log(result.data, 'result');
        sendResponse(response, true, 'Payment details retrieved successfully', result.data, 200);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        sendResponse(response, false, error.message, error.response?.data || error, 400);
    }
});


//api v2 payment with store card
exports.makepaymentwithsaveCardV2 = catchAsyncError(async (req, response, next) => {
    console.log('Payment request received with stored card token');
    const { cardId, amount } = req.body;
    const userId = 1; // Example userId, replace as needed

    try {
        // Step 1: Retrieve the card token from the database
        const card = await Card.findOne({ _id: cardId, userId: userId });
        if (!card) {
            sendResponse(response, false, 'Card not found for this user', '', 404);
            return;
        }

        const cardToken = card.cardToken; // Stored card token
        console.log(cardToken, 'Stored card token found');

        // Step 2: Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Step 3: Create an order
        const orderRequest = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount, // Use the amount passed from the request body
                },
                payee: {
                    merchant_id: 'F2EJBXZ4ZQF54', // Replace with your sandbox merchant ID
                },
                description: "Payment for order using stored card token"
            }]
        };

        // Step 4: Create an order on PayPal
        const orderResult = await axios({
            url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
            method: 'post',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: orderRequest
        });

        const orderId = orderResult.data.id;
        console.log(orderResult.data, 'Order created');
        //get store card details from the api 
        const result = await axios({
            url: `https://api-m.sandbox.paypal.com/v1/vault/credit-cards/${cardToken}`,
            method: 'get',
            headers: {
               Authorization: 'Bearer' + ' ' + accessToken,
                'Content-Type': 'application/json',
            },
        });
      
        console.log('Stored Card Details:', result.data);

        // Step 5: Capture the payment using the stored card token
        const captureRequest = {
            payment_source: {
                token: {
                    id: cardToken,   // Stored card token
                    type: 'CARD' // Type should be CREDIT_CARD
                }
                // card: {
                //     number: "4111111111111111",  // Sample Visa card number (replace with actual data)
                //     expiry: "2026-12",          // Expiry in YYYY-MM format
                //     security_code: "123",       // CVV code
                //     name: "John Doe",           // Cardholder's name
                //     billing_address: {
                //         address_line_1: "123 Main St",
                //         address_line_2: "Apt 4",
                //         admin_area_2: "San Francisco",
                //         admin_area_1: "CA",   // State/Province
                //         postal_code: "94107",
                //         country_code: "US"    // ISO country code
                //     }
                // }
            }
        };

        const paypalRequestId = `req-${Date.now()}`; // Generate a unique PayPal-Request-Id

        // Step 6: Capture the payment
        const captureResult = await axios({
            url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
            method: 'post',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'PayPal-Request-Id': paypalRequestId, // Unique PayPal-Request-Id header
            },
            data: captureRequest
        });

        console.log(captureResult.data, 'Payment captured successfully');
        sendResponse(response, true, 'Payment captured successfully', captureResult.data, 200);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        sendResponse(response, false, error.message, error.response?.data || error, 400);
    }
});

  


