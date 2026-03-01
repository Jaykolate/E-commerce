const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// @POST /api/chat/conversation — start or get existing conversation
const getOrCreateConversation = async (req, res) => {
  const { receiverId, listingId } = req.body;

  if (receiverId === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot chat with yourself" });
  }

  // check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, receiverId] },
    listing: listingId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, receiverId],
      listing: listingId,
    });
  }

  await conversation.populate([
    { path: "participants", select: "name avatar" },
    { path: "listing", select: "title images" },
  ]);

  res.status(200).json({ conversation });
};

// @GET /api/chat/conversations — get all conversations for current user
const getMyConversations = async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "name avatar")
    .populate("listing", "title images")
    .sort("-lastMessageAt");

  res.status(200).json({ count: conversations.length, conversations });
};

// @GET /api/chat/:conversationId/messages — get messages in a conversation
const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  // verify user is part of conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });

  if (!conversation.participants.includes(req.user._id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name avatar")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  // mark messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    },
    { $push: { readBy: req.user._id } }
  );

  res.status(200).json({ count: messages.length, messages: messages.reverse() });
};

module.exports = { getOrCreateConversation, getMyConversations, getMessages };