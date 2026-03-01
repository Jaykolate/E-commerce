const Order = require("../models/Order");
const Listing = require("../models/Listing");
const { createNotification } = require("../services/notificationService");
const { createPaymentIntent, verifyPayment } = require("../services/paymentService");

// @POST /api/orders/create — initiate order + create stripe payment intent
const createOrder = async (req, res) => {
    const { listingId, shippingAddress } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.status !== "active") {
        return res.status(400).json({ message: "This item is no longer available" });
    }

    if (listing.seller.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot buy your own listing" });
    }

    // create stripe payment intent
    const paymentIntent = await createPaymentIntent(listing.price);

    // save order in DB
    const order = await Order.create({
        buyer: req.user._id,
        seller: listing.seller,
        listing: listingId,
        amount: listing.price,
        stripePaymentIntentId: paymentIntent.id,
        shippingAddress,
    });

    res.status(201).json({
        message: "Order created",
        order,
        clientSecret: paymentIntent.client_secret, // send to frontend to complete payment
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
};

// @POST /api/orders/verify — verify payment after stripe checkout
const verifyPaymentHandler = async (req, res) => {
    const { paymentIntentId, orderId } = req.body;

    const isValid = await verifyPayment(paymentIntentId);

    if (!isValid) {
        return res.status(400).json({ message: "Payment verification failed" });
    }

    // update order
    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            stripePaymentId: paymentIntentId,
            paymentStatus: "paid",
            orderStatus: "confirmed",
        },
        { new: true }
    );
    await createNotification(
      order.seller,
      "new_order",
     "You have a new order!",
      `/orders/${order._id}`
    );

    // mark listing as sold
    await Listing.findByIdAndUpdate(order.listing, { status: "sold" });

    res.status(200).json({ message: "Payment verified successfully", order });
};

// @PATCH /api/orders/:id/ship — seller marks as shipped
const markShipped = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
    }

    order.orderStatus = "shipped";
    await order.save();
    await createNotification(
     order.buyer,
      "order_shipped",
       "Your order has been shipped!",
        `/orders/${order._id}`
    );

    res.status(200).json({ message: "Order marked as shipped", order });
};

// @PATCH /api/orders/:id/confirm — buyer confirms delivery
const confirmDelivery = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.buyer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
    }

    order.orderStatus = "completed";
    order.escrowReleased = true;
    await order.save();

    res.status(200).json({ message: "Delivery confirmed", order });
};

// @GET /api/orders/my
const getMyOrders = async (req, res) => {
    const orders = await Order.find({
        $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
        .populate("listing", "title images price")
        .populate("buyer", "name email")
        .populate("seller", "name email")
        .sort("-createdAt");

    res.status(200).json({ count: orders.length, orders });
};

// @GET /api/orders/:id
const getOrder = async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("listing", "title images price")
        .populate("buyer", "name email avatar")
        .populate("seller", "name email avatar");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
        order.buyer._id.toString() !== req.user._id.toString() &&
        order.seller._id.toString() !== req.user._id.toString()
    ) {
        return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ order });
};

module.exports = {
    createOrder,
    verifyPayment: verifyPaymentHandler,
    markShipped,
    confirmDelivery,
    getMyOrders,
    getOrder,
};