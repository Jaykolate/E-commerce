import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { FiShield, FiLock, FiChevronLeft } from "react-icons/fi";
import api from "../services/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_STYLE = {
    style: {
        base: {
            fontSize: "15px",
            color: "#1C1714",
            fontFamily: "DM Sans, sans-serif",
            "::placeholder": { color: "#BFB5A8" },
        },
        invalid: { color: "#ef4444" },
    },
};

// ── Inner Form (needs Stripe context) ──
function CheckoutForm({ order, clientSecret }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        name: "", phone: "", street: "", city: "", state: "", pincode: "",
    });

    const handleChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handlePay = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        const { name, phone, street, city, state, pincode } = shippingAddress;
        if (!name || !phone || !street || !city || !state || !pincode) {
            return toast.error("Please fill in all shipping details");
        }

        setLoading(true);
        try {
            // confirm payment with stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                    billing_details: { name },
                },
                return_url: `${window.location.origin}/orders`,
            }, { handleActions: false });

            if (result.error) {
                toast.error(result.error.message);
                setLoading(false);
                return;
            }

            if (result.paymentIntent.status === "succeeded") {
                // verify on backend
                await api.post("/orders/verify", {
                    paymentIntentId: result.paymentIntent.id,
                    orderId: order._id,
                });

                // update shipping address
                await api.patch(`/orders/${order._id}/shipping`, { shippingAddress });

                toast.success("Payment successful! 🎉");
                navigate("/orders");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePay}>
            <div className="grid md:grid-cols-2 gap-8">

                {/* Left — Shipping + Payment */}
                <div className="space-y-6">

                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-5">
                            Shipping Address
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-stone-600 block mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        name="name"
                                        value={shippingAddress.name}
                                        onChange={handleChange}
                                        placeholder="XYZ"
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-stone-600 block mb-1.5">
                                        Phone *
                                    </label>
                                    <input
                                        name="phone"
                                        value={shippingAddress.phone}
                                        onChange={handleChange}
                                        placeholder="9999999999"
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-stone-600 block mb-1.5">
                                    Street Address *
                                </label>
                                <input
                                    name="street"
                                    value={shippingAddress.street}
                                    onChange={handleChange}
                                    placeholder="123 MG Road, Apt 4B"
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-stone-600 block mb-1.5">City *</label>
                                    <input
                                        name="city"
                                        value={shippingAddress.city}
                                        onChange={handleChange}
                                        placeholder="Pune"
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-stone-600 block mb-1.5">State *</label>
                                    <input
                                        name="state"
                                        value={shippingAddress.state}
                                        onChange={handleChange}
                                        placeholder="Maharashtra"
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-stone-600 block mb-1.5">Pincode *</label>
                                    <input
                                        name="pincode"
                                        value={shippingAddress.pincode}
                                        onChange={handleChange}
                                        placeholder="411001"
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Details */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                                Card Details
                            </div>
                            <div className="flex items-center gap-1 text-xs text-stone-400">
                                <FiLock size={11} />
                                Secured by Stripe
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-stone-600 block mb-1.5">
                                    Card Number
                                </label>
                                <div className="input py-3.5">
                                    <CardNumberElement options={CARD_STYLE} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-stone-600 block mb-1.5">
                                        Expiry Date
                                    </label>
                                    <div className="input py-3.5">
                                        <CardExpiryElement options={CARD_STYLE} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-stone-600 block mb-1.5">
                                        CVC
                                    </label>
                                    <div className="input py-3.5">
                                        <CardCvcElement options={CARD_STYLE} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Card Hint */}
                        <div className="mt-4 bg-stone-50 rounded-xl p-3">
                            <div className="text-xs text-stone-500">
                                🧪 Test card: <span className="font-mono font-medium">4242 4242 4242 4242</span>
                                · Any future date · Any 3-digit CVC
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right — Order Summary */}
                <div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                        <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-5">
                            Order Summary
                        </div>

                        {/* Item */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                {order.listing?.images?.[0] ? (
                                    <img
                                        src={order.listing.images[0].url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-stone-900 text-sm mb-1">
                                    {order.listing?.title}
                                </div>
                                <div className="text-xs text-stone-500">
                                    Sold by {order.seller?.name}
                                </div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-stone-600">Item price</span>
                                <span className="text-stone-900">₹{order.amount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-stone-600">Platform fee</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-stone-600">Shipping</span>
                                <span className="text-stone-500">By seller</span>
                            </div>
                            <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                                <span className="font-semibold text-stone-900">Total</span>
                                <span className="font-serif text-2xl text-stone-900">
                                    ₹{order.amount}
                                </span>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center gap-2 mb-6 text-xs text-stone-500">
                            <FiShield size={14} className="text-terracotta" />
                            Payment held in escrow until delivery confirmed
                        </div>

                        {/* Pay Button */}
                        <button
                            type="submit"
                            disabled={loading || !stripe}
                            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FiLock size={16} />
                                    Pay ₹{order.amount}
                                </>
                            )}
                        </button>

                    </div>
                </div>

            </div>
        </form>
    );
}

// ── Main Checkout Page ──
export default function Checkout() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [order, setOrder] = useState(location.state?.order || null);
    const [clientSecret, setClientSecret] = useState(location.state?.clientSecret || null);
    const [loading, setLoading] = useState(!order);

    useEffect(() => {
        if (!order) fetchOrder();
    }, []);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/orders/${orderId}`);
            setOrder(res.data.order);
            if (!clientSecret) {
                toast.error("Payment session expired. Please try again.");
                navigate(`/listings/${res.data.order.listing?._id}`);
            }
        } catch {
            toast.error("Order not found");
            navigate("/explore");
        } finally {
            setLoading(false);
        }
    };

    if (loading || !order || !clientSecret) {
        return (
            <div className="bg-cream min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-stone-200 border-t-terracotta rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-cream min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
                    >
                        <FiChevronLeft size={16} /> Back
                    </button>
                    <h1 className="font-serif text-4xl text-stone-900 mb-2">Checkout</h1>
                    <p className="text-stone-500 text-sm flex items-center gap-1.5">
                        <FiShield size={14} className="text-terracotta" />
                        Your payment is secured and encrypted by Stripe
                    </p>
                </div>

                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm order={order} clientSecret={clientSecret} />
                </Elements>

            </div>
        </div>
    );
}