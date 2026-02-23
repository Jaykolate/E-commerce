const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 1000,
    },
    brand: {
      type: String,
      trim: true,
      default: "Unbranded",
    },
    category: {
      type: String,
      required: true,
      enum: ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "ethnic", "activewear", "other"],
    },
    size: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom"],
    },
    condition: {
      type: String,
      required: true,
      enum: ["new_with_tags", "like_new", "good", "fair", "worn"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // cloudinary public id for deletion
      },
    ],
    status: {
      type: String,
      enum: ["draft", "active", "sold", "swapped", "expired"],
      default: "draft",
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
    },
    tags: [String],
  },
  { timestamps: true }
);

// text index for search
listingSchema.index({ title: "text", description: "text", brand: "text" });

// compound indexes for common filter/sort patterns
listingSchema.index({ status: 1, createdAt: -1 }); // default listing feed
listingSchema.index({ status: 1, category: 1 });   // category filter
listingSchema.index({ status: 1, price: 1 });       // price filter & sort

module.exports = mongoose.model("Listing", listingSchema);
