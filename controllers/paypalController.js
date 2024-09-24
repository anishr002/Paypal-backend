const paypalService = require("../services/paypalService");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const orderID = await paypalService.createOrder();
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
