import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { setCredentials } from "../../store/authSlice";
import { registerUser } from "../../services/authService";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "buyer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      const data = await registerUser(form);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success("Welcome to Threadly! 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
            Join thousands giving clothes a{" "}
            <em className="text-terracotta italic">second life.</em>
          </h2>
          <p className="text-stone-400 font-light text-lg leading-relaxed">
            Buy, sell, and swap pre-loved fashion. Sustainable, simple, and surprisingly fun.
          </p>
          <div className="flex gap-8 mt-12">
            {[
              { num: "12K+", label: "Listings" },
              { num: "4.8★", label: "Avg Rating" },
              { num: "2K+", label: "Buyers" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif text-2xl text-white">{s.num}</div>
                <div className="text-xs text-stone-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-stone-600">
          © 2025 Threadly. Give clothes a second life.
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden font-serif text-2xl text-stone-900 mb-8">
            Thread<span className="text-terracotta">ly</span>
          </div>

          <h1 className="font-serif text-4xl text-stone-900 mb-2">Create account</h1>
          <p className="text-stone-500 text-sm mb-10">
            Already have an account?{" "}
            <Link to="/login" className="text-terracotta font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {/* Role Toggle */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-8">
            {["buyer", "seller"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${
                  form.role === r
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                I want to {r === "buyer" ? "Buy" : "Sell"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="input-group">
              <label className="text-sm font-medium text-stone-700 block mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="input pl-11"
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-stone-700 block mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
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
                "Create Account"
              )}
            </button>

          </form>

          <p className="text-xs text-stone-400 text-center mt-8 leading-relaxed">
            By creating an account you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span> and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>

        </div>
      </div>

    </div>
  );
}