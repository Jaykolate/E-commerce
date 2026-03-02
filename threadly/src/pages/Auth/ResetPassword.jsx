import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import api from "../../services/api";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (form.password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        setLoading(true);
        try {
            await api.post(`/auth/reset-password/${token}`, { password: form.password });
            setDone(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset failed. Link may have expired.");
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
                        Set a new <em className="text-terracotta italic">password.</em>
                    </h2>
                    <p className="text-stone-400 font-light text-lg leading-relaxed">
                        Choose something strong and memorable. You're almost there.
                    </p>
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

                    {done ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiCheckCircle size={32} className="text-green-600" />
                            </div>
                            <h1 className="font-serif text-3xl text-stone-900 mb-3">Password updated!</h1>
                            <p className="text-stone-500 text-sm leading-relaxed mb-8">
                                Your password has been reset successfully.
                                <br />Redirecting you to the login page in a moment…
                            </p>
                            <Link
                                to="/login"
                                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
                            >
                                Sign In Now
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="font-serif text-4xl text-stone-900 mb-2">New Password</h1>
                            <p className="text-stone-500 text-sm mb-10">
                                Must be at least 6 characters.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* New Password */}
                                <div>
                                    <label className="text-sm font-medium text-stone-700 block mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <FiLock
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                            size={16}
                                        />
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="New password"
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

                                {/* Confirm Password */}
                                <div>
                                    <label className="text-sm font-medium text-stone-700 block mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <FiLock
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                            size={16}
                                        />
                                        <input
                                            name="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="input pl-11 pr-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                                        >
                                            {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
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
                                        "Reset Password"
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
