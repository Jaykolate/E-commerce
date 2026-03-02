# 🧵 Threadly — Pre-loved Fashion Marketplace

> *"Wear it again, wear it well."*

Threadly is a full-stack sustainable fashion marketplace where users can **buy, sell, and swap** pre-loved clothing. Built with React + Node.js, it features real-time chat, AI-assisted listing creation, Stripe payments, and a unique item-swap system.

🌐 **Live Demo:** [threadly-liart.vercel.app](https://threadly-liart.vercel.app)  
🔧 **Backend API:** [threadly-eigu.onrender.com](https://threadly-eigu.onrender.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛍️ **Buy & Sell** | List pre-loved clothes with AI-generated descriptions |
| 🔄 **Swap System** | Propose item-for-item swaps — no money needed |
| 💬 **Real-time Chat** | Socket.IO powered messaging between buyers and sellers |
| 🔐 **Auth** | JWT access tokens + httpOnly refresh token cookies |
| 📧 **Forgot Password** | Secure email reset flow via Gmail SMTP (Nodemailer) |
| ❤️ **Wishlist** | Save favourite listings |
| ⭐ **Reviews** | Seller trust scores built from verified buyer reviews |
| 💳 **Stripe Payments** | Secure checkout with Stripe |
| 🔔 **Notifications** | Real-time in-app notifications |
| 🤖 **AI Listings** | Gemini AI assists with listing title & description |
| 👑 **Admin Panel** | Manage users and listings |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + Vite
- **Redux Toolkit** — auth state management
- **React Router v6** — client-side routing
- **Axios** — API client with auto token refresh
- **Socket.IO Client** — real-time chat
- **Stripe.js** — payment UI
- **Tailwind CSS** — utility-first styling
- **React Hot Toast** — notifications

### Backend
- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose**
- **Socket.IO** — real-time events
- **JWT** — access & refresh token auth
- **Nodemailer** — transactional email
- **Cloudinary** — image storage
- **Stripe** — payment processing
- **Google Gemini AI** — listing assistant
- **Helmet + CORS** — security

---

## 📁 Project Structure

```
project1/
├── server/                  # Node.js Express backend
│   ├── controllers/         # Route handlers (auth, listings, swaps...)
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── middleware/          # Auth, error handling
│   ├── services/            # Notification, email services
│   ├── socket/              # Socket.IO chat handler
│   ├── utils/               # Token generation, helpers
│   └── server.js            # Entry point
│
└── threadly/                # React frontend
    ├── src/
    │   ├── pages/           # Route-level components
    │   │   ├── Auth/        # Login, Register, ForgotPassword, ResetPassword
    │   │   ├── Home.jsx
    │   │   ├── Explore.jsx
    │   │   ├── ListingDetail.jsx
    │   │   ├── SwapPropose.jsx
    │   │   ├── BuyerDashboard.jsx
    │   │   ├── SellerDashboard.jsx
    │   │   └── ...
    │   ├── components/      # Shared UI components
    │   ├── services/        # API service functions
    │   ├── store/           # Redux store & slices
    │   └── hooks/           # Custom hooks (useSocket)
    └── public/
        └── threadly.svg     # Custom brand favicon
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Stripe account
- Gmail + App Password (for email)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/threadly.git
cd threadly
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../threadly
npm install
```

Create `threadly/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## 🌐 Deployment

### Backend → [Render](https://render.com)
| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Add all env vars from `server/.env` in the Render dashboard. Set `CLIENT_URL` to your Vercel frontend URL (no trailing slash).

### Frontend → [Vercel](https://vercel.com)
| Setting | Value |
|---|---|
| Root Directory | `threadly` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Add in Vercel Environment Variables:
```
VITE_API_URL=https://your-render-api.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> **Note:** `vercel.json` with URL rewrites is included for React Router support.

---

## 🔐 Auth Flow

```
Register / Login
    → Access Token (localStorage, 15 min)
    → Refresh Token (httpOnly cookie, 7 days)

Every API request → Authorization: Bearer <accessToken>
On 401 → Auto-refresh via /api/auth/refresh-token
```

**Forgot Password Flow:**
```
Enter email → Hashed token saved to DB (15 min TTL)
           → Raw token sent via email link
User clicks link → Submits new password
               → Token validated + cleared from DB
```

---

## 🔄 Swap System

Threadly's swap system allows **item-for-item exchanges**:

- **Sellers** → Select one of their active listings to offer
- **Buyers** (no listings) → Describe their item via freeform form
- Receiver can **accept**, **reject**, or **counter** with a different item
- Proposer can **accept the counter** or cancel

---

## 📸 Screenshots

| Home | Explore | Swap Propose |
<img width="1891" height="874" alt="Screenshot 2026-03-02 203408" src="https://github.com/user-attachments/assets/b0f0a997-e968-452b-8e0a-98c53535045d" />
|-<img width="1897" height="875" alt="Screenshot 2026-03-02 202954" src="https://github.com/user-attachments/assets/5bd4d6f9-3a2b-4e33-8256-74395d08e4bd" />
--|---|---|
| <img width="1890" height="871" alt="Screenshot 2026-03-02 202856" src="https://github.com/user-attachments/assets/aa15e03a-f110-4218-b9d1-34b8b287db85" />
Hero with listing cards | Filter by category | Buyer freeform offer |

---

## 📝 License

MIT © 2025 Threadly — Give clothes a second life. 🧵
