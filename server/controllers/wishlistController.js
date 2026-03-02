const User = require("../models/user");
const Listing = require("../models/Listing");

// @POST /api/wishlist/toggle/:listingId
const toggleWishlist = async (req, res) => {
    const listingId = req.params.listingId;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // only load wishlist field — avoids password validation error on user.save()
    const user = await User.findById(req.user._id).select("wishlist");

    // compare as strings since wishlist stores ObjectIds
    const isWishlisted = user.wishlist.some((id) => id.toString() === listingId);

    if (isWishlisted) {
        // $pull removes the item — skips Mongoose validation entirely
        await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: listingId } });
        return res.status(200).json({ wishlisted: false, message: "Removed from wishlist" });
    } else {
        // $addToSet adds only if not already present — atomic and safe
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: listingId } });
        return res.status(200).json({ wishlisted: true, message: "Added to wishlist" });
    }
};

// @GET /api/wishlist
const getWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).select("wishlist").populate({
        path: "wishlist",
        populate: { path: "seller", select: "name avatar" },
    });

    res.status(200).json({ count: user.wishlist.length, wishlist: user.wishlist });
};

module.exports = { toggleWishlist, getWishlist };
