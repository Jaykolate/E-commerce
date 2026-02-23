const Listing = require("../models/Listing");
const slugify = require("../utils/slugify");
const APIFeatures = require("../utils/apiFeatures");
const { uploadImage, deleteImage } = require("../services/cloudinaryService");

// @GET /api/listings — browse all active listings
const getListings = async (req, res) => {
  // Build query — search() must come before filter() so $text merges into _filterConditions
  const features = new APIFeatures(Listing.find(), req.query)
    .search()
    .filter()
    .sort()
    .paginate();

  // Run both queries in parallel for speed
  const [listings, total] = await Promise.all([
    features.query.populate("seller", "name avatar trustScore"),
    Listing.countDocuments(features.getFilterConditions()),
  ]);

  res.status(200).json({ total, count: listings.length, listings });
};

// @GET /api/listings/:id — get single listing
const getListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(
    "seller",
    "name avatar trustScore sellerRating"
  );

  if (!listing) return res.status(404).json({ message: "Listing not found" });

  // increment views
  listing.views += 1;
  await listing.save();

  res.status(200).json({ listing });
};

// @POST /api/listings — create listing
const createListing = async (req, res) => {

  const { title, description, brand, category, size, condition, price, status, tags } = req.body;

  // upload images to cloudinary
  let images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadImage(file.buffer);
      images.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  const listing = await Listing.create({
    seller: req.user._id,
    title,
    description,
    brand,
    category,
    size,
    condition,
    price,
    images,
    status: status || "draft",
    tags: tags ? tags.split(",") : [],
    slug: slugify(title),
  });

  res.status(201).json({ message: "Listing created", listing });
};

// @PUT /api/listings/:id — update listing
const updateListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) return res.status(404).json({ message: "Listing not found" });

  if (listing.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to update this listing" });
  }

  // upload new images if any
  if (req.files && req.files.length > 0) {
    let newImages = [];
    for (const file of req.files) {
      const result = await uploadImage(file.buffer);
      newImages.push({ url: result.secure_url, publicId: result.public_id });
    }
    req.body.images = [...listing.images, ...newImages];
  }

  if (req.body.title) req.body.slug = slugify(req.body.title);

  const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ message: "Listing updated", listing: updated });
};

// @DELETE /api/listings/:id — delete listing
const deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) return res.status(404).json({ message: "Listing not found" });

  if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to delete this listing" });
  }

  // delete images from cloudinary
  for (const image of listing.images) {
    if (image.publicId) await deleteImage(image.publicId);
  }

  await listing.deleteOne();
  res.status(200).json({ message: "Listing deleted successfully" });
};

// @GET /api/listings/my — get current seller's listings
const getMyListings = async (req, res) => {
  const listings = await Listing.find({ seller: req.user._id }).sort("-createdAt");
  res.status(200).json({ count: listings.length, listings });
};

module.exports = { getListings, getListing, createListing, updateListing, deleteListing, getMyListings };