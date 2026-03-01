import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { FiShoppingBag, FiHeart, FiUser, FiMenu } from "react-icons/fi";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-stone-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-serif text-2xl text-stone-900 tracking-tight">
          Thread<span className="text-terracotta">ly</span>
        </Link>

        {/* Nav Links */}
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/wishlist" className="w-10 h-10 flex items-center justify-center rounded-xl border border-stone-200 text-stone-700 hover:border-terracotta hover:text-terracotta transition-all">
                <FiHeart size={18} />
              </Link>
              <Link to="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-xl border border-stone-200 text-stone-700 hover:border-terracotta hover:text-terracotta transition-all">
                <FiUser size={18} />
              </Link>
              <Link to="/listings/create" className="btn-primary text-sm py-2 px-5">
                + Sell
              </Link>
              <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline text-sm py-2 px-5">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">
                Sign Up
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}