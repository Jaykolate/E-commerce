const User = require("../models/user");
const Listing = require("../models/Listing");
const Order = require("../models/Order");
const Swap = require("../models/Swap");
const Review = require("../models/Review");

// @GET /api/admin/dashboard — platform overview
const getDashboard = async (req, res) => {
  const [
    totalUsers,
    totalListings,
    activeListings,
    totalOrders,
    completedOrders,
    totalSwaps,
    completedSwaps,
  ] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Listing.countDocuments({ status: "active" }),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "completed" }),
    Swap.countDocuments(),
    Swap.countDocuments({ status: "completed" }),
  ]);

  // revenue from completed orders
  const revenueData = await Order.aggregate([
    { $match: { orderStatus: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  // recent orders
  const recentOrders = await Order.find()
    .populate("buyer", "name email")
    .populate("listing", "title price")
    .sort("-createdAt")
    .limit(5);

  // recent users
  const recentUsers = await User.find()
    .select("name email role createdAt")
    .sort("-createdAt")
    .limit(5);

  res.status(200).json({
    stats: {
      totalUsers,
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      totalSwaps,
      completedSwaps,
      totalRevenue,
    },
    recentOrders,
    recentUsers,
  });
};

// @GET /api/admin/users — get all users
const getAllUsers = async (req, res) => {
  const users = await User.find().sort("-createdAt");
  res.status(200).json({ count: users.length, users });
};

// @PATCH /api/admin/users/:id/deactivate — deactivate a user
const deactivateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ message: "User deactivated", user });
};

// @PATCH /api/admin/users/:id/activate — reactivate a user
const activateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ message: "User activated", user });
};

// @GET /api/admin/listings — get all listings
const getAllListings = async (req, res) => {
  const listings = await Listing.find()
    .populate("seller", "name email")
    .sort("-createdAt");
  res.status(200).json({ count: listings.length, listings });
};

// @PATCH /api/admin/listings/:id/remove — admin removes a listing
const removeListing = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { status: "expired" },
    { new: true }
  );
  if (!listing) return res.status(404).json({ message: "Listing not found" });
  res.status(200).json({ message: "Listing removed", listing });
};

module.exports = {
  getDashboard,
  getAllUsers,
  deactivateUser,
  activateUser,
  getAllListings,
  removeListing,
};