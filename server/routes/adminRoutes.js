const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  deactivateUser,
  activateUser,
  getAllListings,
  removeListing,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// all admin routes protected + restricted to admin role
router.use(protect, restrictTo("admin"));

router.get("/dashboard", getDashboard);
router.get("/users", getAllUsers);
router.patch("/users/:id/deactivate", deactivateUser);
router.patch("/users/:id/activate", activateUser);
router.get("/listings", getAllListings);
router.patch("/listings/:id/remove", removeListing);

module.exports = router;