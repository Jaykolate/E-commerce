import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiHeart, FiShare2, FiShield, FiRefreshCw,
    FiStar, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { getListing } from "../services/listingService";
import api from "../services/api";

const conditionLabels = {
    new_with_tags: "New with Tags",
    like_new: "Like New",
    good: "Good",
    fair: "Fair",
    worn: "Worn",
};

export default function ListingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [orderLoading, setOrderLoading] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        fetchListing();
    }, [id]);

    // fetch wishlist state after listing loads
    useEffect(() => {
        if (user && listing) fetchWishlistState();
    }, [user, listing]);

    const fetchWishlistState = async () => {
        try {
            const res = await api.get("/wishlist");
            const ids = res.data.wishlist.map((l) => l._id ? l._id : l);
            setWishlisted(ids.includes(listing._id));
        } catch {
            // silently fail — not critical
        }
    };

    const handleToggleWishlist = async () => {
        if (!user) return navigate("/login");
        setWishlistLoading(true);
        try {
            const res = await api.post(`/wishlist/toggle/${listing._id}`);
            setWishlisted(res.data.wishlisted);
            toast.success(res.data.wishlisted ? "Added to wishlist ❤️" : "Removed from wishlist");
        } catch {
            toast.error("Could not update wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    const fetchListing = async () => {
        try {
            const data = await getListing(id);
            setListing(data.listing);
        } catch {
            toast.error("Listing not found");
            navigate("/explore");
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async () => {
        if (!user) return navigate("/login");
        setOrderLoading(true);
        try {
            const res = await api.post("/orders/create", {
                listingId: listing._id,
                shippingAddress: {
                    name: user.name,
                    phone: "",
                    street: "",
                    city: "",
                    state: "",
                    pincode: "",
                },
            });
            toast.success("Order created! Proceed to payment.");
            navigate(`/checkout/${res.data.order._id}`, {
                state: { clientSecret: res.data.clientSecret, order: res.data.order },
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create order");
        } finally {
            setOrderLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!user) return navigate("/login");
        try {
            const res = await api.post("/chat/conversation", {
                receiverId: listing.seller._id,
                listingId: listing._id,
            });
            navigate(`/chat/${res.data.conversation._id}`);
        } catch {
            toast.error("Could not start conversation");
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="bg-stone-100 aspect-[3/4] rounded-2xl" />
                    <div className="space-y-4 pt-4">
                        <div className="h-4 bg-stone-100 rounded w-1/4" />
                        <div className="h-8 bg-stone-100 rounded w-3/4" />
                        <div className="h-10 bg-stone-100 rounded w-1/3" />
                    </div>
                </div>
            </div>
        );
    }

    if (!listing) return null;

    const isSeller = user?._id === listing.seller._id;

    return (
        <div className="bg-cream min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-8">
                    <Link to="/" className="hover:text-terracotta">Home</Link>
                    <span>/</span>
                    <Link to="/explore" className="hover:text-terracotta">Explore</Link>
                    <span>/</span>
                    <span className="text-stone-700 capitalize">{listing.category}</span>
                    <span>/</span>
                    <span className="text-stone-700 truncate max-w-xs">{listing.title}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-12">

                    {/* Images */}
                    <div>
                        <div className="relative aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden mb-4">
                            {listing.images?.length > 0 ? (
                                <img
                                    src={listing.images[activeImg].url}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl">👗</div>
                            )}

                            {/* Image Nav */}
                            {listing.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImg((i) => Math.max(i - 1, 0))}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-stone-50"
                                    >
                                        <FiChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setActiveImg((i) => Math.min(i + 1, listing.images.length - 1))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-stone-50"
                                    >
                                        <FiChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {listing.images?.length > 1 && (
                            <div className="flex gap-3">
                                {listing.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        className={`w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? "border-terracotta" : "border-transparent"
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="pt-2">
                        {/* Brand + Actions */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-semibold tracking-widest uppercase text-stone-500">
                                {listing.brand}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleToggleWishlist}
                                    disabled={wishlistLoading}
                                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${wishlisted
                                            ? "bg-terracotta border-terracotta text-white"
                                            : "border-stone-200 text-stone-500 hover:text-terracotta hover:border-terracotta"
                                        }`}
                                >
                                    <FiHeart size={16} fill={wishlisted ? "currentColor" : "none"} />
                                </button>
                                <button className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:text-terracotta hover:border-terracotta transition-all">
                                    <FiShare2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h1 className="font-serif text-3xl text-stone-900 leading-tight mb-4">
                            {listing.title}
                        </h1>

                        {/* Price */}
                        <div className="font-serif text-4xl text-stone-900 mb-5">
                            ₹{listing.price}
                        </div>

                        {/* Tags Row */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full capitalize">
                                {listing.category}
                            </span>
                            <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full">
                                Size {listing.size}
                            </span>
                            <span className="text-xs bg-terracotta-pale text-terracotta-dark px-3 py-1.5 rounded-full">
                                {conditionLabels[listing.condition]}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-stone-600 text-sm leading-relaxed mb-8">
                            {listing.description}
                        </p>

                        {/* Tags */}
                        {listing.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {listing.tags.map((tag) => (
                                    <span key={tag} className="text-xs text-stone-500 bg-stone-50 px-2.5 py-1 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* CTA Buttons */}
                        {!isSeller && listing.status === "active" && (
                            <div className="flex flex-col gap-3 mb-8">
                                <button
                                    onClick={handleBuy}
                                    disabled={orderLoading}
                                    className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {orderLoading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Buy Now — ₹" + listing.price
                                    )}
                                </button>
                                <button
                                    onClick={handleMessage}
                                    className="btn-outline w-full py-4 text-base"
                                >
                                    Message Seller
                                </button>
                                <Link
                                    to={`/swaps/propose?receiverListing=${listing._id}`}
                                    className="btn-secondary w-full py-4 text-base flex items-center justify-center gap-2"
                                >
                                    <FiRefreshCw size={16} /> Propose a Swap
                                </Link>
                            </div>
                        )}

                        {isSeller && (
                            <div className="flex gap-3 mb-8">
                                <Link
                                    to={`/listings/${listing._id}/edit`}
                                    className="btn-outline flex-1 py-3 text-sm text-center"
                                >
                                    Edit Listing
                                </Link>
                            </div>
                        )}

                        {listing.status !== "active" && !isSeller && (
                            <div className="bg-stone-100 rounded-xl p-4 mb-8 text-center">
                                <p className="text-stone-600 font-medium capitalize">
                                    This item is {listing.status} — no longer available
                                </p>
                            </div>
                        )}

                        {/* Trust Badges */}
                        <div className="flex flex-col gap-3 mb-8">
                            {[
                                { icon: <FiShield size={16} />, text: "Secure payment via Stripe" },
                                { icon: <FiRefreshCw size={16} />, text: "Easy returns within 3 days" },
                                { icon: <FiStar size={16} />, text: "Verified seller profile" },
                            ].map((b) => (
                                <div key={b.text} className="flex items-center gap-3 text-sm text-stone-600">
                                    <div className="text-terracotta">{b.icon}</div>
                                    {b.text}
                                </div>
                            ))}
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white rounded-2xl p-5 border border-stone-100">
                            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">
                                Seller
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-terracotta-pale flex items-center justify-center font-semibold text-terracotta-dark text-lg">
                                    {listing.seller?.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-stone-900">{listing.seller?.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                                        <span className="text-terracotta">★</span>
                                        <span>{listing.seller?.sellerRating || "New"}</span>
                                        {listing.seller?.totalReviews > 0 && (
                                            <span>· {listing.seller.totalReviews} reviews</span>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    to={`/profile/${listing.seller?._id}`}
                                    className="text-xs text-terracotta font-medium hover:underline"
                                >
                                    View Profile →
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}