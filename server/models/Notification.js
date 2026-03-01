const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "new_order",
        "order_confirmed",
        "order_shipped",
        "order_delivered",
        "swap_proposed",
        "swap_accepted",
        "swap_rejected",
        "swap_countered",
        "new_message",
        "new_review",
        "listing_expired",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // frontend route to redirect to
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);