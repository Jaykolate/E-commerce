const express = require("express");
const router = express.Router();
const { toggleWishlist, getWishlist } = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getWishlist);
router.post("/toggle/:listingId", protect, toggleWishlist);

module.exports = router;
