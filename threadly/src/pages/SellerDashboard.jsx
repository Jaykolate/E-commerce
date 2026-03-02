import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiPackage, FiDollarSign, FiEye, FiStar,
    FiPlus, FiEdit2, FiTrash2, FiToggleLeft,
    FiToggleRight, FiTrendingUp, FiRefreshCw
} from "react-icons/fi";
import { getMyListings, deleteListing } from "../services/listingService";
import api from "../services/api";

const statusColors = {
    active: "bg-green-50 text-green-700",
    draft: "bg-stone-100 text-stone-600",
    sold: "bg-blue-50 text-blue-700",
    swapped: "bg-purple-50 text-purple-700",
    expired: "bg-red-50 text-red-700",
};

export default function SellerDashboard() {
    const { user } = useSelector((state) => state.auth);
    const [listings, setListings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("listings");
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [listingsRes, ordersRes, swapsRes] = await Promise.all([
                getMyListings(),
                api.get("/orders/my"),
                api.get("/swaps/my"),
            ]);
            setListings(listingsRes.listings);

            // all orders where current user is seller
            const allOrders = ordersRes.data.orders;
            setOrders(
                allOrders.filter((o) => {
                    const sellerId = o.seller?._id || o.seller;
                    return sellerId === user._id;
                })
            );

            // all swaps where current user is receiver
            const allSwaps = swapsRes.data.swaps;
            setSwaps(
                allSwaps.filter((s) => {
                    const receiverId = s.receiver?._id || s.receiver;
                    return receiverId === user._id;
                })
            );

        } catch (err) {
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteListing(id);
            setListings((prev) => prev.filter((l) => l._id !== id));
            toast.success("Listing deleted");
            setDeleteId(null);
        } catch {
            toast.error("Failed to delete listing");
        }
    };

    const handleToggleStatus = async (listing) => {
        const newStatus = listing.status === "active" ? "draft" : "active";
        try {
            const formData = new FormData();
            formData.append("status", newStatus);
            await api.put(`/listings/${listing._id}`, formData);
            setListings((prev) =>
                prev.map((l) => l._id === listing._id ? { ...l, status: newStatus } : l)
            );
            toast.success(`Listing ${newStatus === "active" ? "published" : "set to draft"}`);
        } catch {
            toast.error("Failed to update status");
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

    // ── Stats ──
    const totalRevenue = orders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.amount, 0);
    const activeListings = listings.filter((l) => l.status === "active").length;
    const soldListings = listings.filter((l) => l.status === "sold").length;
    const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

    const stats = [
        { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: <FiDollarSign size={20} />, color: "text-green-600", bg: "bg-green-50" },
        { label: "Active Listings", value: activeListings, icon: <FiPackage size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Items Sold", value: soldListings, icon: <FiTrendingUp size={20} />, color: "text-terracotta", bg: "bg-terracotta-pale" },
        { label: "Total Views", value: totalViews.toLocaleString(), icon: <FiEye size={20} />, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="bg-cream min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="font-serif text-4xl text-stone-900 mb-1">
                            Seller Dashboard
                        </h1>
                        <p className="text-stone-500 text-sm">
                            Welcome back, {user?.name?.split(" ")[0]} 👋
                        </p>
                    </div>
                    <Link to="/listings/create" className="btn-primary flex items-center gap-2">
                        <FiPlus size={16} /> New Listing
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
                            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
                                {s.icon}
                            </div>
                            <div className="font-serif text-2xl text-stone-900 mb-1">{s.value}</div>
                            <div className="text-xs text-stone-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Seller Rating */}
                {user?.sellerRating > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm mb-8 flex items-center gap-5">
                        <div className="w-14 h-14 bg-terracotta-pale rounded-full flex items-center justify-center font-serif text-2xl text-terracotta-dark font-bold">
                            {user.name?.[0]}
                        </div>
                        <div>
                            <div className="font-semibold text-stone-900">{user.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="text-terracotta text-sm">
                                    {"★".repeat(Math.round(user.sellerRating))}
                                    {"☆".repeat(5 - Math.round(user.sellerRating))}
                                </div>
                                <span className="text-sm font-medium text-stone-700">
                                    {user.sellerRating}
                                </span>
                                <span className="text-xs text-stone-500">
                                    · {user.totalReviews} reviews
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit mb-8">
                    {["listings", "orders", "swaps"].map((tab) => (
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
                                {tab === "listings" ? listings.length : tab === "orders" ? orders.length : swaps.length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── LISTINGS TAB ── */}
                {activeTab === "listings" && (
                    <div>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-24" />
                                ))}
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="text-6xl mb-4">👗</div>
                                <h3 className="font-serif text-2xl text-stone-900 mb-2">No listings yet</h3>
                                <p className="text-stone-500 text-sm mb-6">
                                    Start selling by creating your first listing
                                </p>
                                <Link to="/listings/create" className="btn-primary">
                                    Create Listing
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {listings.map((listing) => (
                                    <div
                                        key={listing._id}
                                        className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow"
                                    >
                                        {/* Image */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                            {listing.images?.[0] ? (
                                                <img
                                                    src={listing.images[0].url}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Link
                                                    to={`/listings/${listing._id}`}
                                                    className="font-medium text-stone-900 hover:text-terracotta transition-colors truncate"
                                                >
                                                    {listing.title}
                                                </Link>
                                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${statusColors[listing.status]}`}>
                                                    {listing.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-stone-500">
                                                <span className="font-serif text-base text-stone-900">₹{listing.price}</span>
                                                <span>Size {listing.size}</span>
                                                <span className="flex items-center gap-1">
                                                    <FiEye size={11} /> {listing.views || 0} views
                                                </span>
                                                <span className="capitalize">{listing.category}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Toggle Active/Draft */}
                                            {["active", "draft"].includes(listing.status) && (
                                                <button
                                                    onClick={() => handleToggleStatus(listing)}
                                                    title={listing.status === "active" ? "Set to Draft" : "Publish"}
                                                    className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:text-terracotta hover:border-terracotta transition-all"
                                                >
                                                    {listing.status === "active"
                                                        ? <FiToggleRight size={18} className="text-green-500" />
                                                        : <FiToggleLeft size={18} />
                                                    }
                                                </button>
                                            )}

                                            {/* Edit */}
                                            <Link
                                                to={`/listings/${listing._id}/edit`}
                                                className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:text-terracotta hover:border-terracotta transition-all"
                                            >
                                                <FiEdit2 size={15} />
                                            </Link>

                                            {/* Delete */}
                                            <button
                                                onClick={() => setDeleteId(listing._id)}
                                                className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:text-red-500 hover:border-red-300 transition-all"
                                            >
                                                <FiTrash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ORDERS TAB ── */}
                {activeTab === "orders" && (
                    <div>
                        {orders.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="font-serif text-2xl text-stone-900 mb-2">No orders yet</h3>
                                <p className="text-stone-500 text-sm">Orders will appear here when buyers purchase your items</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-center gap-5">
                                            {/* Listing Image */}
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                                {order.listing?.images?.[0] ? (
                                                    <img src={order.listing.images[0].url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">👗</div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-stone-900 truncate mb-1">
                                                    {order.listing?.title}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-stone-500">
                                                    <span>Buyer: {order.buyer?.name}</span>
                                                    <span className="font-serif text-sm text-stone-900">₹{order.amount}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className={`text-xs px-3 py-1 rounded-full capitalize ${order.orderStatus === "completed" ? "bg-green-50 text-green-700" :
                                                    order.orderStatus === "shipped" ? "bg-blue-50 text-blue-700" :
                                                        order.orderStatus === "confirmed" ? "bg-yellow-50 text-yellow-700" :
                                                            "bg-stone-100 text-stone-600"
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>

                                                {order.orderStatus === "confirmed" && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await api.patch(`/orders/${order._id}/ship`);
                                                                toast.success("Marked as shipped!");
                                                                fetchData();
                                                            } catch {
                                                                toast.error("Failed to update");
                                                            }
                                                        }}
                                                        className="btn-primary py-1.5 px-4 text-xs"
                                                    >
                                                        Mark Shipped
                                                    </button>
                                                )}
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
                                <h3 className="font-serif text-2xl text-stone-900 mb-2">No swap requests yet</h3>
                                <p className="text-stone-500 text-sm">Swap proposals from buyers will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {swaps.map((swap) => (
                                    <div key={swap._id} className="bg-white rounded-2xl p-6 shadow-sm">
                                        {/* Swap Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2">
                                                <FiRefreshCw size={16} className="text-terracotta" />
                                                <span className="text-sm font-medium text-stone-900">Swap received</span>
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
                                                <div className="text-xs text-stone-500 mt-1">₹{swap.proposerListing?.price}</div>
                                                <div className="text-xs text-terracotta mt-1">{swap.proposer?.name}'s item</div>
                                            </div>

                                            {/* Arrow */}
                                            <div className="text-2xl">⇄</div>

                                            {/* Receiver Item */}
                                            <div className="flex-1 bg-stone-50 rounded-xl p-4 text-center">
                                                <div className="w-16 h-16 bg-stone-100 rounded-xl mx-auto mb-2 overflow-hidden">
                                                    {(swap.counterListing || swap.receiverListing)?.images?.[0] ? (
                                                        <img src={(swap.counterListing || swap.receiverListing).images[0].url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                                                    )}
                                                </div>
                                                <div className="text-xs font-medium text-stone-900 line-clamp-2">
                                                    {(swap.counterListing || swap.receiverListing)?.title}
                                                </div>
                                                <div className="text-xs text-stone-500 mt-1">₹{(swap.counterListing || swap.receiverListing)?.price}</div>
                                                <div className="text-xs text-terracotta mt-1">Your item</div>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        {swap.message && (
                                            <div className="bg-stone-50 rounded-xl p-3 mb-4 text-sm text-stone-600 italic">
                                                {`"${swap.message}"`}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            {swap.status === "proposed" && (
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* ── Delete Confirm Modal ── */}
            {deleteId && (
                <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 px-6">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl">
                        <div className="text-4xl mb-4">🗑️</div>
                        <h3 className="font-serif text-2xl text-stone-900 mb-2">Delete listing?</h3>
                        <p className="text-stone-500 text-sm mb-6">
                            This action cannot be undone. The listing will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="btn-outline flex-1 py-3"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="flex-1 py-3 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}