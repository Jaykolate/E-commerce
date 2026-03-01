const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

// one review per order
reviewSchema.index({ reviewer: 1, order: 1 }, { unique: true });

// auto update seller rating after review save
reviewSchema.post("save", async function () {
  const Review = this.constructor;
  const User = require("./user");

  const stats = await Review.aggregate([
    { $match: { seller: this.seller } },
    {
      $group: {
        _id: "$seller",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.seller, {
      sellerRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  }
});

module.exports = mongoose.model("Review", reviewSchema);