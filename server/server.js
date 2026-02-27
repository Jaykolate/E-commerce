const dotenv = require("dotenv");
dotenv.config(); // Must be called first before any other imports that use process.env

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const orderRoutes = require("./routes/orderRoutes");
connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Threadly API is running 🧵");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));