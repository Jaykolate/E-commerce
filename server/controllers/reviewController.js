const Review = require("../models/Review");
const Order = require("../models/Order");
const { createNotification } = require("../services/notificationService");

// @POST /api/reviews — create a review
const createReview = async (req, res) => {
  const { orderId, rating, comment } = req.body;

  // verify order exists and is completed
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.orderStatus !== "completed") {
    return res.status(400).json({ message: "Can only review completed orders" });
  }

  if (order.buyer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only the buyer can leave a review" });
  }

  // check if already reviewed
  const existing = await Review.findOne({ reviewer: req.user._id, order: orderId });
  if (existing) {
    return res.status(400).json({ message: "You have already reviewed this order" });
  }

  const review = await Review.create({
    reviewer: req.user._id,
    seller: order.seller,
    order: orderId,
    rating,
    comment,
  });

  // notify seller
  await createNotification(
    order.seller,
    "new_review",
    `You received a ${rating} star review!`,
    `/profile/${order.seller}`
  );

  await review.populate("reviewer", "name avatar");
  res.status(201).json({ message: "Review submitted", review });
};

// @GET /api/reviews/:sellerId — get all reviews for a seller
const getSellerReviews = async (req, res) => {
  const reviews = await Review.find({ seller: req.params.sellerId })
    .populate("reviewer", "name avatar")
    .sort("-createdAt");

  res.status(200).json({ count: reviews.length, reviews });
};

module.exports = { createReview, getSellerReviews };