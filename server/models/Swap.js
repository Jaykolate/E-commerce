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
    // item proposer is offering
    proposerListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
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