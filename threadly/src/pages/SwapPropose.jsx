import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiRefreshCw } from "react-icons/fi";
import api from "../services/api";
import { getMyListings, getListing } from "../services/listingService";

export default function SwapPropose() {
    const [searchParams] = useSearchParams();
    const receiverListingId = searchParams.get("receiverListing");
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [receiverListing, setReceiverListing] = useState(null);
    const [myListings, setMyListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [receiverRes, myRes] = await Promise.all([
                getListing(receiverListingId),
                getMyListings(),
            ]);
            setReceiverListing(receiverRes.listing);
            // only show active listings
            setMyListings(myRes.listings.filter((l) => l.status === "active"));
        } catch {
            toast.error("Failed to load listings");
            navigate("/explore");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedListing) {
            return toast.error("Please select a listing to offer");
        }
        setSubmitting(true);
        try {
            await api.post("/swaps", {
                proposerListingId: selectedListing._id,
                receiverListingId,
                message,
            });
            toast.success("Swap proposed! 🔄");
            navigate("/orders");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to propose swap");
        } finally {
            setSubmitting(false);
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
            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-terracotta text-sm font-medium mb-3">
                        <FiRefreshCw size={16} />
                        Propose a Swap
                    </div>
                    <h1 className="font-serif text-4xl text-stone-900 mb-2">
                        What will you offer?
                    </h1>
                    <p className="text-stone-500 text-sm">
                        Select one of your active listings to swap with the item below.
                    </p>
                </div>

                {/* They Want → You Offer */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                    <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">
                        They have (you want this)
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                            {receiverListing?.images?.[0] ? (
                                <img
                                    src={receiverListing.images[0].url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>
                            )}
                        </div>
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                                {receiverListing?.brand}
                            </div>
                            <div className="font-medium text-stone-900 mb-1">
                                {receiverListing?.title}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-stone-500">
                                <span>Size {receiverListing?.size}</span>
                                <span className="font-serif text-stone-900">₹{receiverListing?.price}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-3 text-stone-400">
                        <div className="h-px w-24 bg-stone-200" />
                        <FiRefreshCw size={20} className="text-terracotta" />
                        <div className="h-px w-24 bg-stone-200" />
                    </div>
                </div>

                {/* Select Your Listing */}
                <div className="mb-8">
                    <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">
                        Your offer — select one of your listings
                    </div>

                    {myListings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                            <div className="text-4xl mb-3">👗</div>
                            <h3 className="font-serif text-xl text-stone-900 mb-2">
                                No active listings
                            </h3>
                            <p className="text-stone-500 text-sm mb-5">
                                You need at least one active listing to propose a swap.
                            </p>
                            <button
                                onClick={() => navigate("/listings/create")}
                                className="btn-primary"
                            >
                                Create a Listing
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {myListings.map((listing) => (
                                <button
                                    key={listing._id}
                                    onClick={() => setSelectedListing(listing)}
                                    className={`text-left bg-white rounded-2xl p-4 shadow-sm border-2 transition-all hover:shadow-md ${selectedListing?._id === listing._id
                                            ? "border-terracotta"
                                            : "border-transparent"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                            {listing.images?.[0] ? (
                                                <img
                                                    src={listing.images[0].url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-stone-500 mb-0.5">{listing.brand}</div>
                                            <div className="text-sm font-medium text-stone-900 truncate">
                                                {listing.title}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-stone-500">Size {listing.size}</span>
                                                <span className="font-serif text-sm text-stone-900">₹{listing.price}</span>
                                            </div>
                                        </div>
                                        {selectedListing?._id === listing._id && (
                                            <div className="w-6 h-6 bg-terracotta rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Preview */}
                {selectedListing && (
                    <div className="bg-terracotta-pale rounded-2xl p-5 mb-8">
                        <div className="text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-4">
                            Swap Preview
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Your item */}
                            <div className="flex-1 text-center">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white mx-auto mb-2">
                                    {selectedListing.images?.[0] ? (
                                        <img src={selectedListing.images[0].url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">👗</div>
                                    )}
                                </div>
                                <div className="text-xs font-medium text-stone-900 line-clamp-1">
                                    {selectedListing.title}
                                </div>
                                <div className="text-xs text-terracotta-dark mt-0.5">Your item</div>
                            </div>

                            <FiRefreshCw size={20} className="text-terracotta flex-shrink-0" />

                            {/* Their item */}
                            <div className="flex-1 text-center">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white mx-auto mb-2">
                                    {receiverListing?.images?.[0] ? (
                                        <img src={receiverListing.images[0].url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">👗</div>
                                    )}
                                </div>
                                <div className="text-xs font-medium text-stone-900 line-clamp-1">
                                    {receiverListing?.title}
                                </div>
                                <div className="text-xs text-terracotta-dark mt-0.5">Their item</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                        Add a message (optional)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder="Hey! I love your jacket, want to swap for my jeans? Both are great condition..."
                        className="input resize-none"
                        maxLength={300}
                    />
                    <div className="text-xs text-stone-400 text-right mt-1">
                        {message.length}/300
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-outline flex-1 py-4"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedListing}
                        className="btn-primary flex-1 py-4 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <FiRefreshCw size={16} />
                                Propose Swap
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}