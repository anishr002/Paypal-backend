const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const AuthService = require("../services/authService");
const { sendResponse } = require("../utils/sendResponse");
const { default: axios } = require("axios");
const authService = new AuthService();

//get token for authorizations paypal
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
//paypal to paypal accounts trnasfer 
exports.paypalToPayPal = catchAsyncError(async (req, response, next) => {
    //create order for paypal aacounts
        const accessToken = await genrateToken();
        const res = await axios({
        //url for check out order 
          url: process.env.PAYPAL_BASE_URL + '/v2/checkout/orders',
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer' + ' ' + accessToken,
          },
          data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
              {
                item: [
                  {
                    name: 'product',
                    descripations: 'product',
                    quantity: 1,
                    units_amount: { currency_code: 'USD', value: '100.00' },
                  },
                ],
                amount: {
                  currency_code: 'USD',
                  value: '100.00',
                  breakdown: {
                    item_total: { currency_code: 'USD', value: '100.00' },
                  },
                },
              },
            ],
            application_context: {
              return_url: 'http://localhost:3000/returnUrl',
              cancel_url: 'http://localhost:3000/cancelUrl',
              user_action: 'PAY_NOW',
            },
          }),
        });
        //we need this link for paypal payment 
        //get paypal approve link for redirect for payment 
        const result = res?.data?.links?.find(
          (item) => item.rel == 'approve',
        ).href;
      sendResponse(response, true, 'Get approve link', result, 200);  
});

//Captures payment for an order. To successfully capture payment for an order, the buyer must first approve the order or a valid payment_source must be provided in the request
exports.capturePaymen = catchAsyncError(
    async (req, Response, next) => {
      console.log(req.params, 'req parms');
      const accessToken = await genrateToken();
      const res = await axios({
        url:
          process.env.PAYPAL_BASE_URL +
          `/v2/checkout/orders/${req.params.orderId}/capture`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer' + ' ' + accessToken,
        },
      });
      console.log(res,'res');
      sendResponse(Response, true, 'payment confirm', res.data, 200);
    },
  );

