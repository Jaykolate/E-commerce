import { Link } from "react-router-dom";
import { FiArrowRight, FiStar, FiRefreshCw, FiShield } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../services/api";

const categories = [
  { name: "Tops", emoji: "👕", slug: "tops" },
  { name: "Bottoms", emoji: "👖", slug: "bottoms" },
  { name: "Dresses", emoji: "👗", slug: "dresses" },
  { name: "Outerwear", emoji: "🧥", slug: "outerwear" },
  { name: "Shoes", emoji: "👟", slug: "shoes" },
  { name: "Accessories", emoji: "👜", slug: "accessories" },
  { name: "Ethnic", emoji: "🥻", slug: "ethnic" },
  { name: "Activewear", emoji: "🩳", slug: "activewear" },
];

const howItWorks = [
  { step: "01", title: "Browse or List", desc: "Explore thousands of pre-loved pieces or upload your own items in minutes with our AI assistant." },
  { step: "02", title: "Buy, Sell or Swap", desc: "Purchase securely with Stripe, or propose a swap directly with another user — no money needed." },
  { step: "03", title: "Ship & Review", desc: "Ship the item, confirm delivery, and leave a review. Your trust score grows with every transaction." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/listings?limit=6&status=active")
      .then((res) => setFeatured(res.data.listings))
      .catch(() => { });
  }, []);

  return (
    <div className="bg-cream min-h-screen">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left: Text Content */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-terracotta-pale text-terracotta-dark text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
              ♻️ Sustainable Fashion Marketplace
            </div>
            <h1 className="font-serif text-6xl leading-tight text-stone-900 tracking-tight mb-4">
              Wear it again,<br />
              <em className="text-terracotta not-italic font-serif italic">wear it well.</em>
            </h1>
            <p className="text-stone-500 text-lg font-light leading-relaxed mb-10 max-w-lg">
              Discover pre-loved fashion from real people. Buy, sell, and swap clothes you'll actually love — at a fraction of the price.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/explore" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                Start Exploring <FiArrowRight />
              </Link>
              <Link to="/register" className="btn-outline text-base px-8 py-4">
                Sell Your Clothes
              </Link>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-10 mt-14 pt-10 border-t border-stone-200">
              {[
                { num: "12K+", label: "Active Listings" },
                { num: "4.8★", label: "Avg Seller Rating" },
                { num: "2K+", label: "Happy Buyers" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-serif text-3xl text-stone-900">{s.num}</div>
                  <div className="text-xs text-stone-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual Panel */}
          <div className="hidden lg:flex flex-1 justify-center items-center">
            <div className="relative w-[420px] h-[480px]">

              {/* Background glow */}
              <div className="absolute inset-0 bg-terracotta/10 rounded-[40px] blur-3xl scale-110" />

              {/* Card 1 — top left, tilted left */}
              <div className="absolute top-0 left-0 w-48 bg-white rounded-2xl shadow-lg overflow-hidden -rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer">
                <div className="aspect-[3/4] bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-6xl">👗</div>
                <div className="p-3">
                  <div className="text-xs text-stone-400 font-medium uppercase tracking-wide mb-0.5">Zara</div>
                  <div className="text-sm font-medium text-stone-800 truncate">Floral Midi Dress</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-base text-stone-900">₹850</span>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Like New</span>
                  </div>
                </div>
              </div>

              {/* Card 2 — top right, tilted right */}
              <div className="absolute top-4 right-0 w-44 bg-white rounded-2xl shadow-lg overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer">
                <div className="aspect-[3/4] bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-6xl">🧥</div>
                <div className="p-3">
                  <div className="text-xs text-stone-400 font-medium uppercase tracking-wide mb-0.5">H&amp;M</div>
                  <div className="text-sm font-medium text-stone-800 truncate">Denim Jacket</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-base text-stone-900">₹1,200</span>
                    <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">Good</span>
                  </div>
                </div>
              </div>

              {/* Card 3 — bottom center */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                <div className="aspect-[3/4] bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center text-6xl">👠</div>
                <div className="p-3">
                  <div className="text-xs text-stone-400 font-medium uppercase tracking-wide mb-0.5">Steve Madden</div>
                  <div className="text-sm font-medium text-stone-800 truncate">Block Heels</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-base text-stone-900">₹650</span>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Like New</span>
                  </div>
                </div>
              </div>

              {/* Floating live badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap z-10">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                128 new drops today
              </div>

              {/* Trending tags */}
              <div className="absolute -bottom-10 left-0 right-0 flex flex-wrap gap-2 justify-center">
                {["#Vintage", "#Streetwear", "#Y2K", "#Ethnic"].map((tag) => (
                  <span key={tag} className="bg-white text-stone-600 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm border border-stone-100 hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl text-stone-900">Browse by Category</h2>
          <Link to="/explore" className="text-sm text-terracotta font-medium hover:underline flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/explore?category=${cat.slug}`}
              className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-stone-700 group-hover:text-terracotta transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl text-stone-900">Fresh Drops</h2>
          <Link to="/explore" className="text-sm text-terracotta font-medium hover:underline flex items-center gap-1">
            See all <FiArrowRight size={14} />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {featured.map((item) => (
              <ListingCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-stone-100 aspect-[3/4]" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-4 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-stone-900 py-24 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold tracking-widest uppercase text-terracotta-light mb-4">
              Simple & Secure
            </div>
            <h2 className="font-serif text-4xl text-white">How Threadly works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="font-serif text-6xl text-terracotta/30 mb-4">{item.step}</div>
                <h3 className="font-sans font-semibold text-white text-lg mb-3">{item.title}</h3>
                <p className="text-stone-300 text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <FiShield size={24} />, title: "Secure Payments", desc: "Every transaction is protected by Stripe. Payment released only after delivery confirmed." },
            { icon: <FiRefreshCw size={24} />, title: "Easy Swaps", desc: "No money needed. Propose a direct item-for-item swap with any seller on the platform." },
            { icon: <FiStar size={24} />, title: "Verified Sellers", desc: "Every seller has a trust score built from real reviews. Shop with confidence." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 bg-terracotta-pale rounded-xl flex items-center justify-center text-terracotta">
                {f.icon}
              </div>
              <div>
                <h3 className="font-sans font-semibold text-stone-900 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-500 font-light leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-terracotta rounded-3xl px-12 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-4xl text-white mb-3">
              Got clothes collecting dust?
            </h2>
            <p className="text-terracotta-pale font-light text-lg">
              List them in under 2 minutes. Our AI does the heavy lifting.
            </p>
          </div>
          <Link
            to="/listings/create"
            className="bg-white text-terracotta font-semibold px-10 py-4 rounded-full hover:bg-stone-50 transition-all whitespace-nowrap flex items-center gap-2 text-base"
          >
            Start Selling <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="font-serif text-xl text-stone-900">
            Thread<span className="text-terracotta">ly</span>
          </div>
          <div className="text-xs text-stone-500">
            © 2025 Threadly. Give clothes a second life.
          </div>
        </div>
      </footer>

    </div>
  );
}

// ── Listing Card Component ──
function ListingCard({ item }) {
  const conditionColors = {
    new_with_tags: "bg-green-50 text-green-800",
    like_new: "bg-green-50 text-green-700",
    good: "bg-yellow-50 text-yellow-800",
    fair: "bg-orange-50 text-orange-800",
    worn: "bg-red-50 text-red-800",
  };
  const conditionLabels = {
    new_with_tags: "New with Tags",
    like_new: "Like New",
    good: "Good",
    fair: "Fair",
    worn: "Worn",
  };

  return (
    <Link to={`/listings/${item._id}`} className="card group block">
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden rounded-t-2xl">
        {item.images?.[0] ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">👗</div>
        )}
        <div className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${conditionColors[item.condition]}`}>
          {conditionLabels[item.condition]}
        </div>
        <button
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center text-stone-500 hover:text-terracotta transition-colors shadow-sm"
          onClick={(e) => e.preventDefault()}
        >
          ♡
        </button>
      </div>
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