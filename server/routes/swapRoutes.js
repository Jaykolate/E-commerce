const express = require("express");
const router = express.Router();
const {
  proposeSwap,
  respondToSwap,
  acceptCounter,
  completeSwap,
  cancelSwap,
  getMySwaps,
  getSwap,
} = require("../controllers/swapController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, proposeSwap);
router.get("/my", protect, getMySwaps);
router.get("/:id", protect, getSwap);
router.patch("/:id/respond", protect, respondToSwap);
router.patch("/:id/accept-counter", protect, acceptCounter);
router.patch("/:id/complete", protect, completeSwap);
router.patch("/:id/cancel", protect, cancelSwap);

module.exports = router;