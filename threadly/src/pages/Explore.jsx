import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiSliders, FiX } from "react-icons/fi";
import ListingCard from "../components/listing/ListingCard";
import { getListings } from "../services/listingService";

const categories = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "ethnic", "activewear", "other"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const conditions = [
  { value: "new_with_tags", label: "New with Tags" },
  { value: "like_new",      label: "Like New" },
  { value: "good",          label: "Good" },
  { value: "fair",          label: "Fair" },
  { value: "worn",          label: "Worn" },
];
const sortOptions = [
  { value: "-createdAt", label: "Newest First" },
  { value: "price",      label: "Price: Low to High" },
  { value: "-price",     label: "Price: High to Low" },
  { value: "-views",     label: "Most Popular" },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search:    searchParams.get("search") || "",
    category:  searchParams.get("category") || "",
    size:      searchParams.get("size") || "",
    condition: searchParams.get("condition") || "",
    sort:      searchParams.get("sort") || "-createdAt",
    minPrice:  searchParams.get("minPrice") || "",
    maxPrice:  searchParams.get("maxPrice") || "",
  });

  useEffect(() => {
    fetchListings();
  }, [filters, page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.search)    params.search = filters.search;
      if (filters.category)  params.category = filters.category;
      if (filters.size)      params.size = filters.size;
      if (filters.condition) params.condition = filters.condition;
      if (filters.minPrice)  params["price[gte]"] = filters.minPrice;
      if (filters.maxPrice)  params["price[lte]"] = filters.maxPrice;

      const data = await getListings(params);
      setListings(data.listings);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "", category: "", size: "",
      condition: "", sort: "-createdAt",
      minPrice: "", maxPrice: "",
    });
    setPage(1);
  };

  const activeFilterCount = [
    filters.category, filters.size, filters.condition,
    filters.minPrice, filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-stone-900 mb-1">Explore</h1>
          <p className="text-stone-500 text-sm">
            {total > 0 ? `${total} items available` : "Browse pre-loved fashion"}
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Search brands, styles, items..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="input pl-11"
            />
          </div>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="input w-48 cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-terracotta text-white border-terracotta"
                : "bg-white border-stone-200 text-stone-700 hover:border-stone-400"
            }`}
          >
            <FiSliders size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-terracotta text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-stone-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-terracotta flex items-center gap-1 hover:underline"
                >
                  <FiX size={14} /> Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

              {/* Category */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                  Category
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateFilter("category", filters.category === c ? "" : c)}
                      className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all ${
                        filters.category === c
                          ? "bg-terracotta text-white border-terracotta"
                          : "border-stone-200 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                  Size
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateFilter("size", filters.size === s ? "" : s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        filters.size === s
                          ? "bg-terracotta text-white border-terracotta"
                          : "border-stone-200 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                  Condition
                </div>
                <div className="flex flex-col gap-2">
                  {conditions.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => updateFilter("condition", filters.condition === c.value ? "" : c.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border text-left transition-all ${
                        filters.condition === c.value
                          ? "bg-terracotta text-white border-terracotta"
                          : "border-stone-200 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                  Price Range (₹)
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    className="input text-sm py-2"
                  />
                  <span className="text-stone-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    className="input text-sm py-2"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category && (
              <FilterPill label={`Category: ${filters.category}`} onRemove={() => updateFilter("category", "")} />
            )}
            {filters.size && (
              <FilterPill label={`Size: ${filters.size}`} onRemove={() => updateFilter("size", "")} />
            )}
            {filters.condition && (
              <FilterPill label={`Condition: ${filters.condition}`} onRemove={() => updateFilter("condition", "")} />
            )}
            {filters.minPrice && (
              <FilterPill label={`Min: ₹${filters.minPrice}`} onRemove={() => updateFilter("minPrice", "")} />
            )}
            {filters.maxPrice && (
              <FilterPill label={`Max: ₹${filters.maxPrice}`} onRemove={() => updateFilter("maxPrice", "")} />
            )}
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
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
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {listings.map((item) => (
                <ListingCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="btn-outline py-2 px-5 text-sm disabled:opacity-40"
                >
                  ← Previous
                </button>
                <span className="text-sm text-stone-500 px-4">
                  Page {page} of {Math.ceil(total / 12)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 12)}
                  className="btn-outline py-2 px-5 text-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-serif text-2xl text-stone-900 mb-2">No items found</h3>
            <p className="text-stone-500 text-sm mb-6">Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 bg-terracotta-pale text-terracotta-dark text-xs font-medium px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-terracotta-dark/60">
        <FiX size={12} />
      </button>
    </div>
  );
}