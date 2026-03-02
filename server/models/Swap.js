const mongoose = require("mongoose");

const swapSchema = new mongoose.Schema(
  {
    proposer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // item proposer is offering — either a listing OR a freeform description
    proposerListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      default: null,           // now optional — buyers may not have listings
    },
    // freeform item offer (used when proposer has no listing)
    proposerItem: {
      title: { type: String, default: "" },
      brand: { type: String, default: "" },
      size: { type: String, default: "" },
      condition: { type: String, default: "" },
      description: { type: String, default: "" },
    },
    // item proposer wants
    receiverListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    status: {
      type: String,
      enum: ["proposed", "countered", "accepted", "rejected", "completed", "cancelled"],
      default: "proposed",
    },
    // if receiver counters with a different item
    counterListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      default: null,
    },
    message: {
      type: String,
      default: "",
      maxlength: 300,
    },
    counterMessage: {
      type: String,
      default: "",
      maxlength: 300,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Swap", swapSchema);