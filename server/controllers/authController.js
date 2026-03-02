const User = require("../models/user");
const { sendTokens, generateAccessToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// @POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const user = await User.create({ name, email, password, role });
  const { accessToken } = sendTokens(res, user);

  res.status(201).json({
    message: "Account created successfully",
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// @POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Account has been deactivated" });
  }

  const { accessToken } = sendTokens(res, user);

  res.status(200).json({
    message: "Login successful",
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};
// @POST /api/auth/refresh-token
const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.id);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};
// @POST /api/auth/logout
const logout = async (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ user });
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    // Check email config is set before doing anything
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your_gmail@gmail.com") {
      return res.status(500).json({
        message: "Email service is not configured. Please contact support.",
      });
    }

    // Generate a raw token and hash it before saving
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"Threadly" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Reset your Threadly password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fafaf9;border-radius:12px;">
            <h2 style="font-family:Georgia,serif;color:#1c1917;margin-bottom:8px;">Thread<span style="color:#c2684a;">ly</span></h2>
            <h3 style="color:#1c1917;margin-top:24px;">Reset your password</h3>
            <p style="color:#57534e;line-height:1.6;">We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>15 minutes</strong>.</p>
            <a href="${resetUrl}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#c2684a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Reset Password</a>
            <p style="color:#a8a29e;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
            <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;"/>
            <p style="color:#a8a29e;font-size:11px;">© 2025 Threadly. Give clothes a second life.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      // If email fails, clear the token so the user can try again cleanly
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("Email send failed:", emailErr.message);
      return res.status(500).json({ message: "Failed to send reset email. Try again later." });
    }

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// @POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the incoming raw token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword };
