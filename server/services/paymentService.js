const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// create stripe payment intent
const createPaymentIntent = async (amount, currency = "inr") => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // stripe needs paise/cents
    currency,
    automatic_payment_methods: { enabled: true },
  });
  return paymentIntent;
};

// verify payment — just check status from stripe
const verifyPayment = async (paymentIntentId) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent.status === "succeeded";
};

module.exports = { createPaymentIntent, verifyPayment };