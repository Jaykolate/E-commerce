const Swap = require("../models/Swap");
const Listing = require("../models/Listing");
const { createNotification } = require("../services/notificationService");

// @POST /api/swaps — propose a swap
const proposeSwap = async (req, res) => {
    const { proposerListingId, proposerItem, receiverListingId, message } = req.body;

    // Must provide either an existing listing OR a freeform item description
    if (!proposerListingId && (!proposerItem || !proposerItem.title)) {
        return res.status(400).json({
            message: "Please select one of your listings OR describe the item you want to offer",
        });
    }

    // validate receiver listing exists
    const receiverListing = await Listing.findById(receiverListingId);
    if (!receiverListing) {
        return res.status(404).json({ message: "The listing you want to swap for was not found" });
    }

    // cant swap with yourself
    if (receiverListing.seller.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot swap with yourself" });
    }

    if (receiverListing.status !== "active") {
        return res.status(400).json({ message: "This listing is no longer available for swap" });
    }

    let proposerListing = null;

    if (proposerListingId) {
        // If proposer has a listing, validate it
        proposerListing = await Listing.findById(proposerListingId);
        if (!proposerListing) {
            return res.status(404).json({ message: "Your listing was not found" });
        }
        if (proposerListing.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You do not own this listing" });
        }
        if (proposerListing.status !== "active") {
            return res.status(400).json({ message: "Your listing is not active" });
        }

        // check for duplicate swap between the same listings
        const existingSwap = await Swap.findOne({
            proposerListing: proposerListingId,
            receiverListing: receiverListingId,
            status: { $in: ["proposed", "countered"] },
        });
        if (existingSwap) {
            return res.status(400).json({ message: "A swap request already exists for these items" });
        }
    }

    const swapData = {
        proposer: req.user._id,
        receiver: receiverListing.seller,
        receiverListing: receiverListingId,
        message,
    };

    if (proposerListingId) {
        swapData.proposerListing = proposerListingId;
    } else {
        swapData.proposerItem = proposerItem; // freeform offer from buyer
    }

    const swap = await Swap.create(swapData);

    await createNotification(
        receiverListing.seller,
        "swap_proposed",
        `Someone wants to swap with your listing!`,
        `/swaps/${swap._id}`
    );

    await swap.populate([
        { path: "proposerListing", select: "title images price" },
        { path: "receiverListing", select: "title images price" },
        { path: "proposer", select: "name avatar" },
        { path: "receiver", select: "name avatar" },
    ]);

    res.status(201).json({ message: "Swap proposed successfully", swap });
};

// @PATCH /api/swaps/:id/respond — accept, reject or counter
const respondToSwap = async (req, res) => {
    const { action, counterListingId, counterMessage } = req.body;
    // action can be "accept", "reject", "counter"

    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap not found" });

    // only receiver can respond
    if (swap.receiver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to respond to this swap" });
    }

    if (!["proposed", "countered"].includes(swap.status)) {
        return res.status(400).json({ message: "This swap cannot be responded to" });
    }

    if (action === "accept") {
        swap.status = "accepted";

        // mark both listings as swapped
        await Listing.findByIdAndUpdate(swap.proposerListing, { status: "swapped" });
        await Listing.findByIdAndUpdate(swap.receiverListing, { status: "swapped" });

    } else if (action === "reject") {
        swap.status = "rejected";

    } else if (action === "counter") {
        if (!counterListingId) {
            return res.status(400).json({ message: "Please provide a listing to counter with" });
        }

        const counterListing = await Listing.findById(counterListingId);
        if (!counterListing) {
            return res.status(404).json({ message: "Counter listing not found" });
        }

        if (counterListing.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You do not own this listing" });
        }

        swap.status = "countered";
        swap.counterListing = counterListingId;
        swap.counterMessage = counterMessage || "";

    } else {
        return res.status(400).json({ message: "Invalid action. Use accept, reject or counter" });
    }

    await swap.save();

    const notifTypeMap = {
        accept: "swap_accepted",
        reject: "swap_rejected",
        counter: "swap_countered",
    };
    await createNotification(
        swap.proposer,
        notifTypeMap[action] || "swap_responded",
        `Your swap proposal was ${action}ed`,
        `/swaps/${swap._id}`
    );

    await swap.populate([
        { path: "proposerListing", select: "title images price" },
        { path: "receiverListing", select: "title images price" },
        { path: "counterListing", select: "title images price" },
        { path: "proposer", select: "name avatar" },
        { path: "receiver", select: "name avatar" },
    ]);

    res.status(200).json({ message: `Swap ${action}ed successfully`, swap });
};

// @PATCH /api/swaps/:id/accept-counter — proposer accepts the counter offer
const acceptCounter = async (req, res) => {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap not found" });

    if (swap.proposer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
    }

    if (swap.status !== "countered") {
        return res.status(400).json({ message: "No counter offer to accept" });
    }

    swap.status = "accepted";

    // mark all involved listings as swapped
    await Listing.findByIdAndUpdate(swap.proposerListing, { status: "swapped" });
    await Listing.findByIdAndUpdate(swap.counterListing, { status: "swapped" });

    await swap.save();
    res.status(200).json({ message: "Counter offer accepted", swap });
};

// @PATCH /api/swaps/:id/complete — mark swap as physically completed
const completeSwap = async (req, res) => {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap not found" });

    if (
        swap.proposer.toString() !== req.user._id.toString() &&
        swap.receiver.toString() !== req.user._id.toString()
    ) {
        return res.status(403).json({ message: "Not authorized" });
    }

    if (swap.status !== "accepted") {
        return res.status(400).json({ message: "Swap must be accepted before completing" });
    }

    swap.status = "completed";
    await swap.save();

    res.status(200).json({ message: "Swap completed successfully", swap });
};

// @PATCH /api/swaps/:id/cancel — proposer cancels their proposal
const cancelSwap = async (req, res) => {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap not found" });

    if (swap.proposer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
    }

    if (!["proposed", "countered"].includes(swap.status)) {
        return res.status(400).json({ message: "This swap cannot be cancelled" });
    }

    swap.status = "cancelled";
    await swap.save();

    res.status(200).json({ message: "Swap cancelled", swap });
};

// @GET /api/swaps/my — get all swaps involving current user
const getMySwaps = async (req, res) => {
    const swaps = await Swap.find({
        $or: [{ proposer: req.user._id }, { receiver: req.user._id }],
    })
        .populate("proposerListing", "title images price")
        .populate("receiverListing", "title images price")
        .populate("counterListing", "title images price")
        .populate("proposer", "name avatar")
        .populate("receiver", "name avatar")
        .sort("-createdAt");

    res.status(200).json({ count: swaps.length, swaps });
};

// @GET /api/swaps/:id — get single swap
const getSwap = async (req, res) => {
    const swap = await Swap.findById(req.params.id)
        .populate("proposerListing", "title images price")
        .populate("receiverListing", "title images price")
        .populate("counterListing", "title images price")
        .populate("proposer", "name avatar")
        .populate("receiver", "name avatar");

    if (!swap) return res.status(404).json({ message: "Swap not found" });

    if (
        swap.proposer._id.toString() !== req.user._id.toString() &&
        swap.receiver._id.toString() !== req.user._id.toString()
    ) {
        return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ swap });
};

module.exports = {
    proposeSwap,
    respondToSwap,
    acceptCounter,
    completeSwap,
    cancelSwap,
    getMySwaps,
    getSwap,
};