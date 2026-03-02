import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiHeart, FiArrowRight, FiTrash2 } from "react-icons/fi";
import api from "../services/api";

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const res = await api.get("/wishlist");
            // filter out any deleted listings (null entries after populate)
            setWishlist(res.data.wishlist.filter(Boolean));
        } catch {
            toast.error("Could not load wishlist");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (listingId) => {
        try {
            await api.post(`/wishlist/toggle/${listingId}`);
            setWishlist((prev) => prev.filter((l) => l._id !== listingId));
            toast.success("Removed from wishlist");
        } catch {
            toast.error("Could not remove item");
        }
    };

    if (loading) {
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
                    <div className="flex items-center gap-2 text-terracotta text-sm font-medium mb-3">
                        <FiHeart size={16} />
                        Your Wishlist
                    </div>
                    <h1 className="font-serif text-4xl text-stone-900 mb-2">
                        Saved Items
                    </h1>
                    <p className="text-stone-500 text-sm">
                        {wishlist.length > 0
                            ? `${wishlist.length} item${wishlist.length > 1 ? "s" : ""} saved`
                            : "Items you love, all in one place"}
                    </p>
                </div>

                {/* Empty State */}
                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-terracotta-pale rounded-full flex items-center justify-center mx-auto mb-5">
                            <FiHeart size={32} className="text-terracotta" />
                        </div>
                        <h2 className="font-serif text-2xl text-stone-900 mb-2">
                            Nothing saved yet
                        </h2>
                        <p className="text-stone-500 text-sm mb-8">
                            Tap the ♡ heart on any listing to save it here.
                        </p>
                        <Link
                            to="/explore"
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            Browse Listings <FiArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {wishlist.map((item) => (
                            <div key={item._id} className="group relative bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">

                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemove(item._id)}
                                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-terracotta opacity-0 group-hover:opacity-100 transition-all hover:bg-terracotta hover:text-white shadow-sm"
                                >
                                    <FiTrash2 size={14} />
                                </button>

                                {/* Image */}
                                <Link to={`/listings/${item._id}`}>
                                    <div className="aspect-[3/4] bg-stone-100 overflow-hidden">
                                        {item.images?.[0] ? (
                                            <img
                                                src={item.images[0].url}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">
                                                👗
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="text-xs text-stone-500 mb-0.5 truncate">
                                            {item.brand}
                                        </div>
                                        <div className="text-sm font-medium text-stone-900 truncate mb-2">
                                            {item.title}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-serif text-lg text-stone-900">
                                                ₹{item.price}
                                            </span>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full capitalize ${item.status === "active"
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-stone-100 text-stone-600"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}