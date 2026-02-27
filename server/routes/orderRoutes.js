const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  markShipped,
  confirmDelivery,
  getMyOrders,
  getOrder,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrder);
router.patch("/:id/ship", protect, markShipped);
router.patch("/:id/confirm", protect, confirmDelivery);

module.exports = router;