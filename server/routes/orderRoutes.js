const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const {
  createOrder,
  verifyPayment,
  markShipped,
  confirmDelivery,
  getMyOrders,
  getOrder,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// ── specific routes first ──
router.post("/create", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/my", protect, getMyOrders);

// ── PATCH sub-routes before generic /:id ──
router.patch("/:id/shipping", protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { shippingAddress: req.body.shippingAddress },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Shipping address updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.patch("/:id/ship", protect, markShipped);
router.patch("/:id/confirm", protect, confirmDelivery);

// ── generic /:id last ──
router.get("/:id", protect, getOrder);

module.exports = router;