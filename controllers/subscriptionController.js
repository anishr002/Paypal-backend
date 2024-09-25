const { refundPayment } = require("../services/paypalService");

const cancelSubscription = async (req, res) => {
  const { captureId, amount } = req.body;

  if (!captureId || !amount) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const refundResult = await refundPayment(captureId, amount);
    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: refundResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { cancelSubscription };
