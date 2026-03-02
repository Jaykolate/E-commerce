import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiPackage, FiRefreshCw, FiStar,
    FiChevronRight, FiMessageCircle
} from "react-icons/fi";
import api from "../services/api";

const orderStatusColors = {
    pending: "bg-stone-100 text-stone-600",
    confirmed: "bg-yellow-50 text-yellow-700",
    shipped: "bg-blue-50 text-blue-700",
    delivered: "bg-teal-50 text-teal-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
};

const orderStatusSteps = ["pending", "confirmed", "shipped", "delivered", "completed"];

export default function BuyerDashboard() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("orders");
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, swapsRes] = await Promise.all([
                api.get("/orders/my"),
                api.get("/swaps/my"),
            ]);

            // all orders where current user is buyer
            const allOrders = ordersRes.data.orders;
            setOrders(
                allOrders.filter((o) => {
                    const buyerId = o.buyer?._id || o.buyer;
                    return buyerId === user._id;
                })
            );

            // all swaps — both sent and received
            setSwaps(swapsRes.data.swaps);

        } catch {
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelivery = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}/confirm`);
            toast.success("Delivery confirmed! Payment released to seller ✓");
            fetchData();
        } catch {
            toast.error("Failed to confirm delivery");
        }
    };

    const handleSwapRespond = async (swapId, action, counterListingId = null) => {
        try {
            await api.patch(`/swaps/${swapId}/respond`, {
                action,
                counterListingId,
            });
            toast.success(`Swap ${action}ed!`);
            fetchData();
        } catch {
            toast.error("Failed to respond to swap");
        }
    };

    const handleCancelSwap = async (swapId) => {
        try {
            await api.patch(`/swaps/${swapId}/cancel`);
            toast.success("Swap cancelled");
            fetchData();
        } catch {
            toast.error("Failed to cancel swap");
        }
    };

    const handleSubmitReview = async () => {
        try {
            await api.post("/reviews", {
                orderId: reviewModal._id,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
            });
            toast.success("Review submitted! ⭐");
            setReviewModal(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review");
        }
    };

    // ── Stats ──
    const totalSpent = orders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.amount, 0);
    const completedOrders = orders.filter((o) => o.orderStatus === "completed").length;
    const activeSwaps = swaps.filter((s) => ["proposed", "countered"].includes(s.status)).length;

    return (
        <div className="bg-cream min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="font-serif text-4xl text-stone-900 mb-1">My Dashboard</h1>
                        <p className="text-stone-500 text-sm">
                            Hey {user?.name?.split(" ")[0]}, here's your activity 👋
                        </p>
                    </div>
                    <Link to="/explore" className="btn-primary flex items-center gap-2">
                        Keep Shopping →
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-5 mb-10">
                    {[
                        {
                            label: "Total Spent",
                            value: `₹${totalSpent.toLocaleString()}`,
                            icon: "💸",
                            bg: "bg-terracotta-pale",
                        },
                        {
                            label: "Orders Completed",
                            value: completedOrders,
                            icon: "✅",
                            bg: "bg-green-50",
                        },
                        {
                            label: "Active Swaps",
                            value: activeSwaps,
                            icon: "🔄",
                            bg: "bg-purple-50",
                        },
                    ].map((s) => (
                        <div key={s.label} className={`${s.bg} rounded-2xl p-6`}>
                            <div className="text-3xl mb-3">{s.icon}</div>
                            <div className="font-serif text-2xl text-stone-900 mb-1">{s.value}</div>
                            <div className="text-xs text-stone-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit mb-8">
                    {["orders", "swaps"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab
                                    ? "bg-white text-stone-900 shadow-sm"
                                    : "text-stone-500 hover:text-stone-700"
                                }`}
                        >
                            {tab}
                            <span className="ml-2 text-xs bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-full">
                                {tab === "orders" ? orders.length : swaps.length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── ORDERS TAB ── */}
                {activeTab === "orders" && (
                    <div>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-32" />
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="text-6xl mb-4">🛍️</div>
                                <h3 className="font-serif text-2xl text-stone-900 mb-2">No orders yet</h3>
                                <p className="text-stone-500 text-sm mb-6">
                                    Start exploring and find something you love!
                                </p>
                                <Link to="/explore" className="btn-primary">Browse Listings</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                                        {/* Order Header */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                                            <div className="text-xs text-stone-500">
                                                Order #{order._id.slice(-8).toUpperCase()}
                                            </div>
                                            <span className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${orderStatusColors[order.orderStatus]}`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>

                                        {/* Order Body */}
                                        <div className="p-6">
                                            <div className="flex items-center gap-5 mb-5">
                                                {/* Image */}
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                                    {order.listing?.images?.[0] ? (
                                                        <img
                                                            src={order.listing.images[0].url}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="font-medium text-stone-900 mb-1">
                                                        {order.listing?.title}
                                                    </div>
                                                    <div className="text-xs text-stone-500">
                                                        Seller: {order.seller?.name}
                                                    </div>
                                                    <div className="font-serif text-xl text-stone-900 mt-1">
                                                        ₹{order.amount}
                                                    </div>
                                                </div>

                                                {/* Message Seller */}
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await api.post("/chat/conversation", {
                                                                receiverId: order.seller?._id,
                                                                listingId: order.listing?._id,
                                                            });
                                                            navigate(`/chat/${res.data.conversation._id}`);
                                                        } catch {
                                                            toast.error("Could not open chat");
                                                        }
                                                    }}
                                                    className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:text-terracotta hover:border-terracotta transition-all"
                                                >
                                                    <FiMessageCircle size={16} />
                                                </button>
                                            </div>

                                            {/* Progress Tracker */}
                                            {order.orderStatus !== "cancelled" && (
                                                <div className="mb-5">
                                                    <div className="flex items-center justify-between mb-2">
                                                        {orderStatusSteps.map((step, i) => {
                                                            const currentIdx = orderStatusSteps.indexOf(order.orderStatus);
                                                            const isDone = i <= currentIdx;
                                                            return (
                                                                <div key={step} className="flex items-center flex-1">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className={`w-3 h-3 rounded-full border-2 transition-all ${isDone
                                                                                ? "bg-terracotta border-terracotta"
                                                                                : "bg-white border-stone-300"
                                                                            }`} />
                                                                        <div className={`text-xs mt-1 capitalize ${isDone ? "text-terracotta font-medium" : "text-stone-400"
                                                                            }`}>
                                                                            {step}
                                                                        </div>
                                                                    </div>
                                                                    {i < orderStatusSteps.length - 1 && (
                                                                        <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentIdx ? "bg-terracotta" : "bg-stone-200"
                                                                            }`} />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                {order.orderStatus === "shipped" && (
                                                    <button
                                                        onClick={() => handleConfirmDelivery(order._id)}
                                                        className="btn-primary py-2.5 px-5 text-sm"
                                                    >
                                                        Confirm Delivery ✓
                                                    </button>
                                                )}
                                                {order.orderStatus === "completed" && !order.reviewed && (
                                                    <button
                                                        onClick={() => setReviewModal(order)}
                                                        className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2"
                                                    >
                                                        <FiStar size={14} /> Leave a Review
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/listings/${order.listing?._id}`}
                                                    className="btn-outline py-2.5 px-5 text-sm flex items-center gap-1"
                                                >
                                                    View Item <FiChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── SWAPS TAB ── */}
                {activeTab === "swaps" && (
                    <div>
                        {swaps.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="text-6xl mb-4">🔄</div>
                                <h3 className="font-serif text-2xl text-stone-900 mb-2">No swaps yet</h3>
                                <p className="text-stone-500 text-sm mb-6">
                                    Find an item you like and propose a swap!
                                </p>
                                <Link to="/explore" className="btn-primary">Browse to Swap</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {swaps.map((swap) => {
                                    const isProposer = swap.proposer?._id === user._id;
                                    return (
                                        <div key={swap._id} className="bg-white rounded-2xl p-6 shadow-sm">

                                            {/* Swap Header */}
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center gap-2">
                                                    <FiRefreshCw size={16} className="text-terracotta" />
                                                    <span className="text-sm font-medium text-stone-900">
                                                        {isProposer ? "You proposed a swap" : "Swap received"}
                                                    </span>
                                                </div>
                                                <span className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${swap.status === "accepted" ? "bg-green-50 text-green-700" :
                                                        swap.status === "rejected" ? "bg-red-50 text-red-700" :
                                                            swap.status === "completed" ? "bg-blue-50 text-blue-700" :
                                                                swap.status === "countered" ? "bg-yellow-50 text-yellow-700" :
                                                                    "bg-stone-100 text-stone-600"
                                                    }`}>
                                                    {swap.status}
                                                </span>
                                            </div>

                                            {/* Items */}
                                            <div className="flex items-center gap-4 mb-5">
                                                {/* Proposer Item */}
                                                <div className="flex-1 bg-stone-50 rounded-xl p-4 text-center">
                                                    <div className="w-16 h-16 bg-stone-100 rounded-xl mx-auto mb-2 overflow-hidden">
                                                        {swap.proposerListing?.images?.[0] ? (
                                                            <img src={swap.proposerListing.images[0].url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-medium text-stone-900 line-clamp-2">
                                                        {swap.proposerListing?.title}
                                                    </div>
                                                    <div className="text-xs text-stone-500 mt-1">
                                                        ₹{swap.proposerListing?.price}
                                                    </div>
                                                    <div className="text-xs text-terracotta mt-1">
                                                        {isProposer ? "Your item" : `${swap.proposer?.name}'s item`}
                                                    </div>
                                                </div>

                                                {/* Arrow */}
                                                <div className="text-2xl">⇄</div>

                                                {/* Receiver Item */}
                                                <div className="flex-1 bg-stone-50 rounded-xl p-4 text-center">
                                                    <div className="w-16 h-16 bg-stone-100 rounded-xl mx-auto mb-2 overflow-hidden">
                                                        {(swap.counterListing || swap.receiverListing)?.images?.[0] ? (
                                                            <img
                                                                src={(swap.counterListing || swap.receiverListing).images[0].url}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-medium text-stone-900 line-clamp-2">
                                                        {(swap.counterListing || swap.receiverListing)?.title}
                                                    </div>
                                                    <div className="text-xs text-stone-500 mt-1">
                                                        ₹{(swap.counterListing || swap.receiverListing)?.price}
                                                    </div>
                                                    <div className="text-xs text-terracotta mt-1">
                                                        {!isProposer ? "Your item" : `${swap.receiver?.name}'s item`}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Message */}
                                            {swap.message && (
                                                <div className="bg-stone-50 rounded-xl p-3 mb-4 text-sm text-stone-600 italic">
                                                    "{swap.message}"
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-3">
                                                {/* Receiver can accept/reject proposed swap */}
                                                {!isProposer && swap.status === "proposed" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSwapRespond(swap._id, "accept")}
                                                            className="btn-primary py-2 px-5 text-sm"
                                                        >
                                                            Accept ✓
                                                        </button>
                                                        <button
                                                            onClick={() => handleSwapRespond(swap._id, "reject")}
                                                            className="py-2 px-5 text-sm border border-red-200 text-red-600 rounded-full hover:bg-red-50 transition-all"
                                                        >
                                                            Reject ✗
                                                        </button>
                                                    </>
                                                )}

                                                {/* Proposer can accept counter */}
                                                {isProposer && swap.status === "countered" && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await api.patch(`/swaps/${swap._id}/accept-counter`);
                                                                toast.success("Counter accepted!");
                                                                fetchData();
                                                            } catch {
                                                                toast.error("Failed to accept counter");
                                                            }
                                                        }}
                                                        className="btn-primary py-2 px-5 text-sm"
                                                    >
                                                        Accept Counter ✓
                                                    </button>
                                                )}

                                                {/* Complete swap */}
                                                {swap.status === "accepted" && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await api.patch(`/swaps/${swap._id}/complete`);
                                                                toast.success("Swap completed! 🎉");
                                                                fetchData();
                                                            } catch {
                                                                toast.error("Failed to complete swap");
                                                            }
                                                        }}
                                                        className="btn-primary py-2 px-5 text-sm"
                                                    >
                                                        Mark as Complete 🎉
                                                    </button>
                                                )}

                                                {/* Cancel */}
                                                {isProposer && ["proposed", "countered"].includes(swap.status) && (
                                                    <button
                                                        onClick={() => handleCancelSwap(swap._id)}
                                                        className="py-2 px-5 text-sm border border-stone-200 text-stone-600 rounded-full hover:bg-stone-50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* ── Review Modal ── */}
            {reviewModal && (
                <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 px-6">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                        <h3 className="font-serif text-2xl text-stone-900 mb-2">Leave a Review</h3>
                        <p className="text-stone-500 text-sm mb-6">
                            How was your experience with {reviewModal.seller?.name}?
                        </p>

                        {/* Star Rating */}
                        <div className="flex gap-2 mb-5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                    className={`text-3xl transition-all ${star <= reviewForm.rating ? "text-terracotta" : "text-stone-300"
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        {/* Comment */}
                        <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            rows={3}
                            placeholder="Tell others about your experience..."
                            className="input resize-none mb-5"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setReviewModal(null)}
                                className="btn-outline flex-1 py-3"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                className="btn-primary flex-1 py-3"
                            >
                                Submit Review ⭐
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}