import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUpload, FiX, FiZap, FiLoader,
  FiDollarSign, FiInfo
} from "react-icons/fi";
import { createListing } from "../services/listingService";
import { autofillListing, suggestPrice } from "../services/aiService";

const categories = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "ethnic", "activewear", "other"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom"];
const conditions = [
  { value: "new_with_tags", label: "New with Tags" },
  { value: "like_new",      label: "Like New" },
  { value: "good",          label: "Good" },
  { value: "fair",          label: "Fair" },
  { value: "worn",          label: "Worn" },
];

const emptyForm = {
  title: "", description: "", brand: "",
  category: "", size: "", condition: "",
  price: "", tags: "", status: "active",
};

export default function CreateListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]); // { file, preview }
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [aiUsed, setAiUsed] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Image Upload ──
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      return toast.error("Maximum 5 images allowed");
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── AI Autofill ──
  const handleAIAutofill = async () => {
    if (images.length === 0) {
      return toast.error("Please upload at least one image first");
    }
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", images[0].file);
      const res = await autofillListing(formData);
      const data = res.data;

      setForm((prev) => ({
        ...prev,
        title:       data.title       || prev.title,
        description: data.description || prev.description,
        brand:       data.brand       || prev.brand,
        category:    data.category    || prev.category,
        size:        data.size        || prev.size,
        condition:   data.condition   || prev.condition,
        price:       data.suggestedPrice || prev.price,
        tags:        data.tags        || prev.tags,
      }));

      setAiUsed(true);
      toast.success("AI filled your listing! Review and adjust ✨");
    } catch (err) {
      toast.error("AI autofill failed. Please fill manually.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Price Suggestion ──
  const handlePriceSuggest = async () => {
    if (!form.brand || !form.category || !form.condition) {
      return toast.error("Fill in brand, category and condition first");
    }
    setPriceLoading(true);
    try {
      const res = await suggestPrice({
        brand: form.brand,
        category: form.category,
        condition: form.condition,
      });
      setPriceSuggestion(res.data);
    } catch {
      toast.error("Could not fetch price suggestion");
    } finally {
      setPriceLoading(false);
    }
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error("Please add at least one image");
    if (!form.category)      return toast.error("Please select a category");
    if (!form.size)          return toast.error("Please select a size");
    if (!form.condition)     return toast.error("Please select a condition");

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((img) => formData.append("images", img.file));
      if (aiUsed) formData.append("aiGenerated", "true");

      const res = await createListing(formData);
      toast.success("Listing published! 🎉");
      navigate(`/listings/${res.listing._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-stone-900 mb-2">List an Item</h1>
          <p className="text-stone-500 text-sm">
            Upload photos and let our AI fill in the details for you.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8">

            {/* ── LEFT: Images + AI ── */}
            <div>

              {/* Image Upload */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">
                  Photos (up to 5)
                </div>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-terracotta hover:bg-terracotta-pale/30 transition-all mb-4"
                >
                  <FiUpload className="mx-auto mb-3 text-stone-400" size={28} />
                  <p className="text-sm text-stone-600 font-medium">
                    Click to upload photos
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    JPG, PNG up to 5MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img
                          src={img.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-stone-900/60 text-white text-xs text-center py-1">
                            Cover
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 w-6 h-6 bg-stone-900/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Autofill Card */}
              <div className="bg-stone-900 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-terracotta rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiZap size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">AI Listing Assistant</h3>
                    <p className="text-stone-400 text-xs leading-relaxed mb-4">
                      Upload a photo and let AI automatically fill in the title, description, brand, size, condition and suggested price.
                    </p>
                    <button
                      type="button"
                      onClick={handleAIAutofill}
                      disabled={aiLoading || images.length === 0}
                      className="bg-terracotta text-white text-sm font-medium px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-terracotta-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FiZap size={14} />
                          {aiUsed ? "Re-run AI Autofill" : "Autofill with AI"}
                        </>
                      )}
                    </button>
                    {aiUsed && (
                      <p className="text-terracotta-light text-xs mt-3 flex items-center gap-1">
                        <FiInfo size={12} /> AI filled this listing. Review before publishing.
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT: Form Fields ── */}
            <div className="space-y-5">

              {/* Title */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                  Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Classic Blue Denim Jacket"
                  className="input"
                />
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the item — fabric, fit, any flaws..."
                  className="input resize-none"
                />
              </div>

              {/* Brand + Category */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                      Brand
                    </label>
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="e.g. Zara, H&M"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="input cursor-pointer capitalize"
                    >
                      <option value="">Select</option>
                      {categories.map((c) => (
                        <option key={c} value={c} className="capitalize">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Size + Condition */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                      Size *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm({ ...form, size: s })}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            form.size === s
                              ? "bg-terracotta text-white border-terracotta"
                              : "border-stone-200 text-stone-700 hover:border-stone-400"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                      Condition *
                    </label>
                    <div className="flex flex-col gap-2">
                      {conditions.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setForm({ ...form, condition: c.value })}
                          className={`text-xs px-3 py-1.5 rounded-full border text-left transition-all ${
                            form.condition === c.value
                              ? "bg-terracotta text-white border-terracotta"
                              : "border-stone-200 text-stone-700 hover:border-stone-400"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                  Price (₹) *
                </label>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">₹</span>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    className="input pl-8"
                  />
                </div>

                {/* Price Suggestion */}
                <button
                  type="button"
                  onClick={handlePriceSuggest}
                  disabled={priceLoading}
                  className="text-xs text-terracotta font-medium flex items-center gap-1.5 hover:underline disabled:opacity-50"
                >
                  {priceLoading ? (
                    <span className="w-3 h-3 border border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
                  ) : (
                    <FiDollarSign size={12} />
                  )}
                  Get AI price suggestion
                </button>

                {priceSuggestion && (
                  <div className="mt-3 bg-terracotta-pale rounded-xl p-4">
                    <div className="text-xs font-semibold text-terracotta-dark mb-1">
                      AI Price Suggestion
                    </div>
                    <div className="font-serif text-2xl text-stone-900 mb-1">
                      ₹{priceSuggestion.suggestedPrice}
                    </div>
                    <div className="text-xs text-stone-500">
                      Range: ₹{priceSuggestion.minPrice} – ₹{priceSuggestion.maxPrice}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      {priceSuggestion.reasoning}
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, price: priceSuggestion.suggestedPrice })}
                      className="mt-3 text-xs bg-terracotta text-white px-3 py-1.5 rounded-full hover:bg-terracotta-dark transition-all"
                    >
                      Use this price
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                  Tags
                </label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="casual, vintage, summer (comma separated)"
                  className="input"
                />
              </div>

              {/* Status */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-3">
                  Publish Status
                </label>
                <div className="flex gap-3">
                  {["active", "draft"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all capitalize ${
                        form.status === s
                          ? "bg-stone-900 text-white border-stone-900"
                          : "border-stone-200 text-stone-600 hover:border-stone-400"
                      }`}
                    >
                      {s === "active" ? "🟢 Publish Now" : "📝 Save as Draft"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  form.status === "active" ? "Publish Listing 🎉" : "Save Draft"
                )}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}