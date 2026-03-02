import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import ListingCard from "../components/listing/ListingCard";

export default function SellerProfile() {
    const { id } = useParams();
    const [seller, setSeller] = useState(null);
    const [listings, setListings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [listingsRes, reviewsRes] = await Promise.all([
                api.get(`/listings?seller=${id}&status=active`),
                api.get(`/reviews/${id}`),
            ]);
            setListings(listingsRes.data.listings);
            setReviews(reviewsRes.data.reviews);
            if (listingsRes.data.listings[0]?.seller) {
                setSeller(listingsRes.data.listings[0].seller);
            }
        } catch {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
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

                {/* Seller Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm mb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-terracotta-pale flex items-center justify-center font-serif text-3xl text-terracotta-dark">
                            {seller?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl text-stone-900 mb-1">
                                {seller?.name || "Seller"}
                            </h1>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="text-terracotta">
                                        {"★".repeat(Math.round(seller?.sellerRating || 0))}
                                        {"☆".repeat(5 - Math.round(seller?.sellerRating || 0))}
                                    </span>
                                    <span className="text-sm font-medium text-stone-700 ml-1">
                                        {seller?.sellerRating || "New"}
                                    </span>
                                </div>
                                {seller?.totalReviews > 0 && (
                                    <span className="text-xs text-stone-500">
                                        · {seller.totalReviews} reviews
                                    </span>
                                )}
                                <span className="text-xs text-stone-500">
                                    · {listings.length} active listings
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-serif text-2xl text-stone-900">
                            Active Listings
                        </h2>
                        <span className="text-sm text-stone-500">{listings.length} items</span>
                    </div>

                    {listings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                            <div className="text-5xl mb-3">👗</div>
                            <p className="text-stone-500">No active listings right now</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {listings.map((item) => (
                                <ListingCard key={item._id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Reviews */}
                <div>
                    <h2 className="font-serif text-2xl text-stone-900 mb-6">
                        Reviews
                    </h2>

                    {reviews.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                            <div className="text-5xl mb-3">⭐</div>
                            <p className="text-stone-500">No reviews yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-terracotta-pale flex items-center justify-center font-semibold text-terracotta-dark">
                                            {review.reviewer?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-stone-900 text-sm">
                                                {review.reviewer?.name}
                                            </div>
                                            <div className="text-terracotta text-sm">
                                                {"★".repeat(review.rating)}
                                                {"☆".repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        <div className="ml-auto text-xs text-stone-400">
                                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-stone-600 leading-relaxed">
                                            {`"${review.comment}"`}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}