import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Explore from "./pages/Explore";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import ProtectedRoute from "./components/common/ProtectedRoute";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import Chat from "./pages/Chat";
import SwapPropose from "./pages/SwapPropose";
import HowItWorks from "./pages/HowItWorks";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import SellerProfile from "./pages/SellerProfile";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/explore" element={<Explore />} />
        {/* ✅ specific BEFORE dynamic */}
        <Route path="/listings/create" element={
          <ProtectedRoute requiredRole="seller"><CreateListing /></ProtectedRoute>
        } />
        <Route path="/listings/:id/edit" element={
          <ProtectedRoute><CreateListing /></ProtectedRoute>
        } />
        <Route path="/listings/:id" element={<ListingDetail />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><SellerDashboard /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><BuyerDashboard /></ProtectedRoute>
        } />

        {/* /swaps redirects to BuyerDashboard (has swaps tab) */}
        <Route path="/swaps" element={
          <ProtectedRoute><BuyerDashboard /></ProtectedRoute>
        } />
        <Route path="/swaps/propose" element={
          <ProtectedRoute><SwapPropose /></ProtectedRoute>
        } />

        {/* ✅ specific BEFORE dynamic */}
        <Route path="/chat" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
        <Route path="/chat/:conversationId" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
        <Route path="/how-it-works" element={<HowItWorks />} />

        {/* Wishlist — dedicated Wishlist page */}
        <Route path="/wishlist" element={
          <ProtectedRoute><Wishlist /></ProtectedRoute>
        } />

        <Route path="/checkout/:orderId" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={<SellerProfile />} />
      </Routes>
    </>
  );
}