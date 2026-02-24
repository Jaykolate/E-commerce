const express = require("express");
const router = express.Router();
const { autofillListing, priceSuggest } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// upload single image → get listing data
router.post("/autofill", protect, upload.single("image"), autofillListing);

// get price suggestion
router.post("/price-suggest", protect, priceSuggest);

module.exports = router;