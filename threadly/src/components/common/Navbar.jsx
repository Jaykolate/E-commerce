import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import {
    FiHeart, FiUser, FiMessageCircle,
    FiMenu, FiX, FiChevronDown,
    FiPackage, FiLogOut, FiPlusCircle,
    FiCompass, FiRefreshCw
} from "react-icons/fi";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function Navbar() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // close profile dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch { }
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate("/");
        setMobileOpen(false);
        setProfileOpen(false);
    };

    return (
        <nav className="bg-white border-b border-stone-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/"
                    className="font-serif text-2xl text-stone-900 tracking-tight flex-shrink-0"
                    onClick={() => setMobileOpen(false)}
                >
                    Thread<span className="text-terracotta">ly</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/explore" className="text-sm text-stone-700 hover:text-terracotta transition-colors">
                        Explore
                    </Link>
                    <Link to="/swaps" className="text-sm text-stone-700 hover:text-terracotta transition-colors">
                        Swaps
                    </Link>
                    <Link to="/how-it-works" className="text-sm text-stone-700 hover:text-terracotta transition-colors">
                        How it works
                    </Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                    {user ? (
                        <>
                            {/* Favourites */}
                            <Link
                                to="/wishlist"
                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-stone-200 text-stone-700 hover:border-terracotta hover:text-terracotta transition-all"
                            >
                                <FiHeart size={18} />
                            </Link>

                            {/* Chat */}
                            <Link
                                to="/chat"
                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-stone-200 text-stone-700 hover:border-terracotta hover:text-terracotta transition-all"
                            >
                                <FiMessageCircle size={18} />
                            </Link>

                            {/* Sell Button */}
                            {user.role === "seller" && (
                                <Link to="/listings/create" className="btn-primary text-sm py-2 px-5">
                                    + Sell
                                </Link>
                            )}

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl border border-stone-200 hover:border-stone-400 transition-all"
                                >
                                    <div className="w-6 h-6 rounded-full bg-terracotta-pale flex items-center justify-center text-xs font-semibold text-terracotta-dark">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-sm text-stone-700 max-w-20 truncate">
                                        {user.name?.split(" ")[0]}
                                    </span>
                                    <FiChevronDown
                                        size={14}
                                        className={`text-stone-500 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {/* Dropdown */}
                                {profileOpen && (
                                    <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden py-2 z-50">

                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-stone-100">
                                            <div className="text-sm font-medium text-stone-900">{user.name}</div>
                                            <div className="text-xs text-stone-500 capitalize">{user.role}</div>
                                        </div>

                                        <Link
                                            to={user.role === "seller" ? "/dashboard" : "/orders"}
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-terracotta transition-colors"
                                        >
                                            <FiPackage size={15} />
                                            {user.role === "seller" ? "Seller Dashboard" : "My Orders"}
                                        </Link>

                                        <Link
                                            to="/chat"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-terracotta transition-colors"
                                        >
                                            <FiMessageCircle size={15} />
                                            Messages
                                        </Link>

                                        <Link
                                            to="/wishlist"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-terracotta transition-colors"
                                        >
                                            <FiHeart size={15} />
                                            Favourites
                                        </Link>

                                        <div className="border-t border-stone-100 mt-2 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                                            >
                                                <FiLogOut size={15} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-outline text-sm py-2 px-5">Login</Link>
                            <Link to="/register" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
                        </>
                    )}
                </div>

                {/* Mobile Right Side */}
                <div className="flex md:hidden items-center gap-2">
                    {user && (
                        <>
                            <Link
                                to="/chat"
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-700"
                            >
                                <FiMessageCircle size={17} />
                            </Link>
                            <Link
                                to="/wishlist"
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-700"
                            >
                                <FiHeart size={17} />
                            </Link>
                        </>
                    )}

                    {/* Hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-700"
                    >
                        {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                    </button>
                </div>

            </div>

            {/* ── Mobile Menu ── */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-1">

                    {/* Nav Links */}
                    <MobileLink to="/explore" icon={<FiCompass size={16} />} onClick={() => setMobileOpen(false)}>
                        Explore
                    </MobileLink>
                    <MobileLink to="/swaps" icon={<FiRefreshCw size={16} />} onClick={() => setMobileOpen(false)}>
                        Swaps
                    </MobileLink>

                    {user ? (
                        <>
                            <div className="border-t border-stone-100 my-3" />

                            {/* User Info */}
                            <div className="flex items-center gap-3 px-3 py-2 mb-2">
                                <div className="w-10 h-10 rounded-full bg-terracotta-pale flex items-center justify-center font-semibold text-terracotta-dark">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-stone-900">{user.name}</div>
                                    <div className="text-xs text-stone-500 capitalize">{user.role}</div>
                                </div>
                            </div>

                            <MobileLink
                                to={user.role === "seller" ? "/dashboard" : "/orders"}
                                icon={<FiPackage size={16} />}
                                onClick={() => setMobileOpen(false)}
                            >
                                {user.role === "seller" ? "Seller Dashboard" : "My Orders"}
                            </MobileLink>

                            <MobileLink to="/chat" icon={<FiMessageCircle size={16} />} onClick={() => setMobileOpen(false)}>
                                Messages
                            </MobileLink>

                            <MobileLink to="/wishlist" icon={<FiHeart size={16} />} onClick={() => setMobileOpen(false)}>
                                Favourites
                            </MobileLink>

                            {user.role === "seller" && (
                                <>
                                    <div className="border-t border-stone-100 my-3" />
                                    <MobileLink
                                        to="/listings/create"
                                        icon={<FiPlusCircle size={16} />}
                                        onClick={() => setMobileOpen(false)}
                                        highlight
                                    >
                                        Create New Listing
                                    </MobileLink>
                                </>
                            )}

                            <div className="border-t border-stone-100 my-3" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <FiLogOut size={16} />
                                Logout
                            </button>

                        </>
                    ) : (
                        <>
                            <div className="border-t border-stone-100 my-3" />
                            <div className="flex flex-col gap-2 pt-1">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="btn-outline w-full py-3 text-center text-sm"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="btn-primary w-full py-3 text-center text-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            )}

        </nav>
    );
}

// ── Mobile Link Helper ──
function MobileLink({ to, icon, children, onClick, highlight }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${highlight
                    ? "bg-terracotta-pale text-terracotta font-medium"
                    : "text-stone-700 hover:bg-stone-50 hover:text-terracotta"
                }`}
        >
            <span className={highlight ? "text-terracotta" : "text-stone-500"}>
                {icon}
            </span>
            {children}
        </Link>
    );
}