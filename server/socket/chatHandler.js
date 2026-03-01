const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const onlineUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  // auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // add user to online map
    onlineUsers.set(socket.userId, socket.id);

    // broadcast online users
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    // join a conversation room
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // leave a conversation room
    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
    });

    // send a message
    socket.on("sendMessage", async (data) => {
      const { conversationId, content } = data;

      try {
        // save message to DB
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          content,
          readBy: [socket.userId],
        });

        // update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content,
          lastMessageAt: new Date(),
        });

        await message.populate("sender", "name avatar");

        // emit to everyone in the room
        io.to(conversationId).emit("newMessage", message);

        // send notification to receiver if they are online but not in room
        const conversation = await Conversation.findById(conversationId);
        const receiverId = conversation.participants
          .find((p) => p.toString() !== socket.userId)
          ?.toString();

        if (receiverId && onlineUsers.has(receiverId)) {
          const receiverSocketId = onlineUsers.get(receiverId);
          io.to(receiverSocketId).emit("messageNotification", {
            conversationId,
            sender: socket.userId,
            content,
          });
        }
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // typing indicator
    socket.on("typing", (conversationId) => {
      socket.to(conversationId).emit("userTyping", { userId: socket.userId });
    });

    socket.on("stopTyping", (conversationId) => {
      socket.to(conversationId).emit("userStoppedTyping", { userId: socket.userId });
    });

    // mark messages as read
    socket.on("markRead", async (conversationId) => {
      try {
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: socket.userId },
            readBy: { $ne: socket.userId },
          },
          { $push: { readBy: socket.userId } }
        );
        socket.to(conversationId).emit("messagesRead", {
          conversationId,
          userId: socket.userId,
        });
      } catch (err) {
        console.error("Mark read error:", err);
      }
    });

    // disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = { initSocket };