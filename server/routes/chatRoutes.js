const express = require("express");
const router = express.Router();
const {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.post("/conversation", protect, getOrCreateConversation);
router.get("/conversations", protect, getMyConversations);
router.get("/:conversationId/messages", protect, getMessages);

module.exports = router;
