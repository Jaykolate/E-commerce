import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import api from "../../services/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong. Try again.");
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
                        Forgot your <em className="text-terracotta italic">password?</em>
                    </h2>
                    <p className="text-stone-400 font-light text-lg leading-relaxed">
                        No worries. We'll send you a secure link to reset it in seconds.
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

                    {sent ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiMail size={32} className="text-green-600" />
                            </div>
                            <h1 className="font-serif text-3xl text-stone-900 mb-3">Check your inbox</h1>
                            <p className="text-stone-500 text-sm leading-relaxed mb-8">
                                We've sent a password reset link to <strong>{email}</strong>.
                                <br />The link will expire in <strong>15 minutes</strong>.
                            </p>
                            <p className="text-xs text-stone-400 mb-6">
                                Didn't receive it? Check your spam folder or{" "}
                                <button
                                    onClick={() => setSent(false)}
                                    className="text-terracotta hover:underline font-medium"
                                >
                                    try again
                                </button>
                                .
                            </p>
                            <Link
                                to="/login"
                                className="btn-outline w-full py-4 text-base flex items-center justify-center gap-2"
                            >
                                <FiArrowLeft size={16} />
                                Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors"
                            >
                                <FiArrowLeft size={14} />
                                Back to Sign In
                            </Link>

                            <h1 className="font-serif text-4xl text-stone-900 mb-2">Reset Password</h1>
                            <p className="text-stone-500 text-sm mb-10">
                                Enter your account email and we'll send you a secure reset link.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="text-sm font-medium text-stone-700 block mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FiMail
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                            size={16}
                                        />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="input pl-11"
                                        />
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
                                        "Send Reset Link"
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
