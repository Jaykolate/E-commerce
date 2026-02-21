const User = require("../models/user");
const { sendTokens, generateAccessToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

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

module.exports = { register, login, refreshToken, logout, getMe };
