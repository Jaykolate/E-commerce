import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";

const conditionColors = {
  new_with_tags: "bg-green-50 text-green-800",
  like_new:      "bg-green-50 text-green-700",
  good:          "bg-yellow-50 text-yellow-800",
  fair:          "bg-orange-50 text-orange-800",
  worn:          "bg-red-50 text-red-800",
};

const conditionLabels = {
  new_with_tags: "New with Tags",
  like_new:      "Like New",
  good:          "Good",
  fair:          "Fair",
  worn:          "Worn",
};

export default function ListingCard({ item }) {
  return (
    <Link to={`/listings/${item._id}`} className="card group block">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden rounded-t-2xl">
        {item.images?.[0] ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-stone-50">
            👗
          </div>
        )}
        {/* Condition Badge */}
        <div className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${conditionColors[item.condition]}`}>
          {conditionLabels[item.condition]}
        </div>
        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center text-stone-400 hover:text-terracotta transition-colors shadow-sm"
          onClick={(e) => e.preventDefault()}
        >
          <FiHeart size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-1">
          {item.brand}
        </div>
        <div className="text-sm font-medium text-stone-900 mb-3 line-clamp-2 leading-snug">
          {item.title}
        </div>
        <div className="flex items-center justify-between">
          <div className="font-serif text-xl text-stone-900">₹{item.price}</div>
          <div className="text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded-lg">
            Size {item.size}
          </div>
        </div>
      </div>
    </Link>
  );
}