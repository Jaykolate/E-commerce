const express = require("express");
const router = express.Router();
const { createReview, getSellerReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReview);
router.get("/:sellerId", getSellerReviews);

module.exports = router;