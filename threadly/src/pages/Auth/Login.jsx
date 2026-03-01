import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { setCredentials } from "../../store/authSlice";
import { loginUser } from "../../services/authService";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(form);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}! 👋`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 flex-col justify-between p-16">
        <div className="font-serif text-3xl text-white">
          Thread<span className="text-terracotta">ly</span>
        </div>
        <div>
          <h2 className="font-serif text-5xl text-white leading-tight mb-6">
            Welcome back to{" "}
            <em className="text-terracotta italic">Threadly.</em>
          </h2>
          <p className="text-stone-400 font-light text-lg leading-relaxed">
            Your wardrobe is waiting. Pick up where you left off.
          </p>

          {/* Testimonial */}
          <div className="mt-12 bg-stone-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-terracotta-pale flex items-center justify-center font-semibold text-terracotta-dark">
                R
              </div>
              <div>
                <div className="text-white text-sm font-medium">Alice M.</div>
                <div className="text-stone-500 text-xs">Verified Seller · Pune</div>
              </div>
            </div>
            <p className="text-stone-300 text-sm font-light leading-relaxed">
              "Sold 12 pieces in my first month. The AI listing tool is a game changer!"
            </p>
            <div className="text-terracotta text-sm mt-2">★★★★★</div>
          </div>
        </div>
        <div className="text-xs text-stone-600">
          © 2025 Threadly. Give clothes a second life.
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden font-serif text-2xl text-stone-900 mb-8">
            Thread<span className="text-terracotta">ly</span>
          </div>

          <h1 className="font-serif text-4xl text-stone-900 mb-2">Sign in</h1>
          <p className="text-stone-500 text-sm mb-10">
            Don't have an account?{" "}
            <Link to="/register" className="text-terracotta font-medium hover:underline">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-700">
                  Password
                </label>
                <span className="text-xs text-terracotta cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="input pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400">or continue as</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <Link
            to="/explore"
            className="btn-outline w-full py-4 text-base flex items-center justify-center gap-2"
          >
            Browse without account
          </Link>

        </div>
      </div>

    </div>
  );
}