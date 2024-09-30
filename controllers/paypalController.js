const paypalService = require("../services/paypalService");
const Order = require("../models/captureOrderSchema"); // Adjust the path as needed

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders from MongoDB
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Create Order
exports.createOrder = async (req, res) => {
  const purchaseUnits = req?.body?.purchaseUnits; // Get purchase units from request body

  const newpurchaseUnits = purchaseUnits || [
    {
      item: [
        {
          name: "product",
          descripations: "product",
          quantity: 1,
          units_amount: { currency_code: "USD", value: "100.00" },
        },
      ],
      amount: {
        currency_code: "USD",
        value: "100.00",
        breakdown: {
          item_total: { currency_code: "USD", value: "100.00" },
        },
      },
    },
  ];
  try {
    const orderID = await paypalService.createOrder(newpurchaseUnits);
    res.json({ id: orderID });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Capture Order
exports.captureOrder = async (req, res) => {
  const { orderID } = req.body;
  try {
    const capture = await paypalService.captureOrder(orderID);
    res.json({ capture });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Generate Client Token
exports.generateClientToken = async (req, res) => {
  console.log(req, "req");
  try {
    const clientToken = await paypalService.generateClientToken();
    res.json({ clientToken });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
