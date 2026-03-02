import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiSend, FiArrowLeft, FiMoreVertical,
    FiPackage
} from "react-icons/fi";
import api from "../services/api";
import { useSocket, getSocket } from "../hooks/useSocket";

export default function Chat() {
    const { conversationId } = useParams();
    const { user, accessToken } = useSelector((state) => state.auth);

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [message, setMessage] = useState("");
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    // init socket
    useSocket(accessToken);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (conversationId && conversations.length > 0) {
            const convo = conversations.find((c) => c._id === conversationId);
            if (convo) openConversation(convo);
        }
    }, [conversationId, conversations]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket event listeners
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on("newMessage", (msg) => {
            setMessages((prev) => {
                // avoid duplicate
                if (prev.find((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
            // update last message in sidebar
            setConversations((prev) =>
                prev.map((c) =>
                    c._id === msg.conversation
                        ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt }
                        : c
                )
            );
        });

        socket.on("onlineUsers", (users) => {
            setOnlineUsers(users);
        });

        socket.on("userTyping", ({ userId }) => {
            if (userId !== user._id) setIsTyping(true);
        });

        socket.on("userStoppedTyping", () => {
            setIsTyping(false);
        });

        return () => {
            socket.off("newMessage");
            socket.off("onlineUsers");
            socket.off("userTyping");
            socket.off("userStoppedTyping");
        };
    }, []);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await api.get("/chat/conversations");
            setConversations(res.data.conversations);
        } catch {
            toast.error("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    const openConversation = async (convo) => {
        setActiveConvo(convo);
        setMsgLoading(true);

        const socket = getSocket();
        // leave previous room
        if (activeConvo) socket?.emit("leaveConversation", activeConvo._id);
        // join new room
        socket?.emit("joinConversation", convo._id);
        socket?.emit("markRead", convo._id);

        try {
            const res = await api.get(`/chat/${convo._id}/messages`);
            setMessages(res.data.messages);
        } catch {
            toast.error("Failed to load messages");
        } finally {
            setMsgLoading(false);
        }
    };

    const sendMessage = () => {
        if (!message.trim() || !activeConvo) return;

        const socket = getSocket();
        socket?.emit("sendMessage", {
            conversationId: activeConvo._id,
            content: message.trim(),
        });

        setMessage("");
        socket?.emit("stopTyping", activeConvo._id);
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);
        const socket = getSocket();
        socket?.emit("typing", activeConvo?._id);

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socket?.emit("stopTyping", activeConvo?._id);
        }, 1500);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getOtherParticipant = (convo) => {
        return convo.participants?.find((p) => p._id !== user._id);
    };

    const isOnline = (userId) => onlineUsers.includes(userId);

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return "Today";
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    // group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = formatDate(msg.createdAt);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {});

    return (
        <div className="bg-cream h-[calc(100vh-64px)] flex overflow-hidden">

            {/* ── SIDEBAR ── */}
            <div className={`
      w-full md:w-80 bg-white border-r border-stone-100 flex flex-col flex-shrink-0
      ${activeConvo && !showSidebar ? "hidden md:flex" : "flex"}
    `}>

                {/* Sidebar Header */}
                <div className="p-5 border-b border-stone-100">
                    <h2 className="font-serif text-2xl text-stone-900">Messages</h2>
                    <p className="text-xs text-stone-500 mt-1">
                        {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-12 h-12 rounded-full bg-stone-100 flex-shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-3 bg-stone-100 rounded w-2/3" />
                                        <div className="h-3 bg-stone-100 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-sm text-stone-500">No conversations yet</p>
                            <Link to="/explore" className="text-xs text-terracotta mt-2 block hover:underline">
                                Browse listings to start chatting
                            </Link>
                        </div>
                    ) : (
                        conversations.map((convo) => {
                            const other = getOtherParticipant(convo);
                            const isActive = activeConvo?._id === convo._id;
                            const online = isOnline(other?._id);

                            return (
                                <button
                                    key={convo._id}
                                    onClick={() => {
                                        openConversation(convo);
                                        setShowSidebar(false); // hide sidebar on mobile when convo opens
                                    }}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-stone-50 transition-colors text-left ${isActive ? "bg-terracotta-pale border-r-2 border-terracotta" : ""
                                        }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-terracotta-pale flex items-center justify-center font-semibold text-terracotta-dark text-lg">
                                            {other?.name?.[0]?.toUpperCase()}
                                        </div>
                                        {online && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-sm font-medium text-stone-900 truncate">
                                                {other?.name}
                                            </span>
                                            <span className="text-xs text-stone-400 flex-shrink-0 ml-2">
                                                {convo.lastMessageAt ? formatDate(convo.lastMessageAt) : ""}
                                            </span>
                                        </div>
                                        <div className="text-xs text-stone-500 truncate">
                                            {convo.lastMessage || `Re: ${convo.listing?.title}`}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── MAIN CHAT AREA ── */}
            {activeConvo ? (
                <div className={`
        flex-1 flex flex-col
        ${showSidebar ? "hidden md:flex" : "flex"}
      `}>

                    {/* Chat Header */}
                    <div className="bg-white border-b border-stone-100 px-4 md:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Back button — mobile only */}
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="md:hidden w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 mr-1"
                            >
                                <FiArrowLeft size={16} />
                            </button>

                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-terracotta-pale flex items-center justify-center font-semibold text-terracotta-dark">
                                    {getOtherParticipant(activeConvo)?.name?.[0]?.toUpperCase()}
                                </div>
                                {isOnline(getOtherParticipant(activeConvo)?._id) && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-stone-900 text-sm">
                                    {getOtherParticipant(activeConvo)?.name}
                                </div>
                                <div className="text-xs text-stone-500">
                                    {isOnline(getOtherParticipant(activeConvo)?._id)
                                        ? <span className="text-green-600">● Online</span>
                                        : "Offline"
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Listing Reference */}
                        {activeConvo.listing && (
                            <Link
                                to={`/listings/${activeConvo.listing._id}`}
                                className="hidden sm:flex items-center gap-2 bg-stone-50 hover:bg-stone-100 transition-colors rounded-xl px-4 py-2"
                            >
                                <FiPackage size={14} className="text-stone-500" />
                                <span className="text-xs text-stone-600 max-w-32 truncate">
                                    {activeConvo.listing.title}
                                </span>
                            </Link>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
                        {msgLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-8 h-8 border-2 border-stone-200 border-t-terracotta rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {Object.entries(groupedMessages).map(([date, msgs]) => (
                                    <div key={date}>
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px bg-stone-200" />
                                            <span className="text-xs text-stone-400 font-medium">{date}</span>
                                            <div className="flex-1 h-px bg-stone-200" />
                                        </div>

                                        {msgs.map((msg, i) => {
                                            const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                                            const showAvatar = !isMine && (i === 0 || msgs[i - 1]?.sender?._id !== msg.sender?._id);

                                            return (
                                                <div
                                                    key={msg._id}
                                                    className={`flex items-end gap-2 mb-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                                                >
                                                    {!isMine && (
                                                        <div className={`w-7 h-7 rounded-full bg-terracotta-pale flex items-center justify-center text-xs font-semibold text-terracotta-dark flex-shrink-0 ${!showAvatar ? "opacity-0" : ""}`}>
                                                            {msg.sender?.name?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine
                                                                ? "bg-terracotta text-white rounded-br-sm"
                                                                : "bg-white text-stone-900 shadow-sm rounded-bl-sm"
                                                            }`}>
                                                            {msg.content}
                                                        </div>
                                                        <span className="text-xs text-stone-400 mt-1 px-1">
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}

                                {/* Typing Indicator */}
                                {isTyping && (
                                    <div className="flex items-end gap-2">
                                        <div className="w-7 h-7 rounded-full bg-terracotta-pale flex items-center justify-center text-xs font-semibold text-terracotta-dark">
                                            {getOtherParticipant(activeConvo)?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="bg-white shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                                            <div className="flex gap-1 items-center">
                                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="bg-white border-t border-stone-100 px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-stone-50 rounded-2xl flex items-center px-4 py-2 gap-3">
                                <textarea
                                    value={message}
                                    onChange={handleTyping}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    rows={1}
                                    className="flex-1 bg-transparent text-sm text-stone-900 outline-none resize-none placeholder-stone-400 max-h-32"
                                />
                            </div>
                            <button
                                onClick={sendMessage}
                                disabled={!message.trim()}
                                className="w-11 h-11 bg-terracotta rounded-2xl flex items-center justify-center text-white hover:bg-terracotta-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                <FiSend size={16} />
                            </button>
                        </div>
                        <p className="text-xs text-stone-400 mt-2 text-center hidden md:block">
                            Press Enter to send · Shift+Enter for new line
                        </p>
                    </div>

                </div>
            ) : (
                /* Empty State — only show on desktop when no convo selected */
                <div className="flex-1 hidden md:flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-7xl mb-6">💬</div>
                        <h3 className="font-serif text-3xl text-stone-900 mb-3">Your Messages</h3>
                        <p className="text-stone-500 text-sm max-w-xs mx-auto leading-relaxed">
                            Select a conversation from the sidebar or message a seller from any listing page.
                        </p>
                        <Link to="/explore" className="btn-primary mt-6 inline-flex">
                            Browse Listings
                        </Link>
                    </div>
                </div>
            )}

        </div>
    );
}