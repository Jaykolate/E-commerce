import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUsers, FiPackage, FiShoppingBag,
  FiRefreshCw, FiDollarSign, FiTrendingUp,
  FiToggleLeft, FiToggleRight, FiTrash2,
  FiEye
} from "react-icons/fi";
import api from "../services/api";

const tabs = ["overview", "users", "listings", "orders"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, listingsRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/admin/listings"),
      ]);
      setStats(dashRes.data.stats);
      setUsers(usersRes.data.users);
      setListings(listingsRes.data.listings);
      setOrders(dashRes.data.recentOrders);
    } catch {
      toast.error("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (id, isActive) => {
    try {
      await api.patch(`/admin/users/${id}/${isActive ? "deactivate" : "activate"}`);
      setUsers((prev) =>
        prev.map((u) => u._id === id ? { ...u, isActive: !isActive } : u)
      );
      toast.success(`User ${isActive ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleRemoveListing = async (id) => {
    try {
      await api.patch(`/admin/listings/${id}/remove`);
      setListings((prev) =>
        prev.map((l) => l._id === id ? { ...l, status: "expired" } : l)
      );
      toast.success("Listing removed");
    } catch {
      toast.error("Failed to remove listing");
    }
  };

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-terracotta-pale text-terracotta-dark text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-4">
            Admin Only
          </div>
          <h1 className="font-serif text-4xl text-stone-900 mb-1">
            Admin Dashboard
          </h1>
          <p className="text-stone-500 text-sm">
            Full platform overview and controls
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && stats && (
          <div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              {[
                {
                  label: "Total Users",
                  value: stats.totalUsers,
                  icon: <FiUsers size={20} />,
                  bg: "bg-blue-50",
                  color: "text-blue-600",
                },
                {
                  label: "Total Listings",
                  value: stats.totalListings,
                  icon: <FiPackage size={20} />,
                  bg: "bg-purple-50",
                  color: "text-purple-600",
                },
                {
                  label: "Total Orders",
                  value: stats.totalOrders,
                  icon: <FiShoppingBag size={20} />,
                  bg: "bg-terracotta-pale",
                  color: "text-terracotta",
                },
                {
                  label: "Total Revenue",
                  value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
                  icon: <FiDollarSign size={20} />,
                  bg: "bg-green-50",
                  color: "text-green-600",
                },
                {
                  label: "Active Listings",
                  value: stats.activeListings,
                  icon: <FiTrendingUp size={20} />,
                  bg: "bg-yellow-50",
                  color: "text-yellow-600",
                },
                {
                  label: "Completed Orders",
                  value: stats.completedOrders,
                  icon: <FiShoppingBag size={20} />,
                  bg: "bg-teal-50",
                  color: "text-teal-600",
                },
                {
                  label: "Total Swaps",
                  value: stats.totalSwaps,
                  icon: <FiRefreshCw size={20} />,
                  bg: "bg-pink-50",
                  color: "text-pink-600",
                },
                {
                  label: "Completed Swaps",
                  value: stats.completedSwaps,
                  icon: <FiRefreshCw size={20} />,
                  bg: "bg-indigo-50",
                  color: "text-indigo-600",
                },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
                    {s.icon}
                  </div>
                  <div className="font-serif text-2xl text-stone-900 mb-1">
                    {s.value}
                  </div>
                  <div className="text-xs text-stone-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders + Recent Users */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-stone-900">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-terracotta hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                        {order.listing?.images?.[0] ? (
                          <img
                            src={order.listing.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">👗</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-900 truncate">
                          {order.listing?.title}
                        </div>
                        <div className="text-xs text-stone-500">
                          {order.buyer?.name} · ₹{order.amount}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize flex-shrink-0 ${
                        order.orderStatus === "completed"
                          ? "bg-green-50 text-green-700"
                          : order.orderStatus === "shipped"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-stone-100 text-stone-600"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-stone-900">Recent Users</h3>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-xs text-terracotta hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-terracotta-pale flex items-center justify-center font-semibold text-terracotta-dark flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                          {user.email}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize flex-shrink-0 ${
                        user.role === "admin"
                          ? "bg-terracotta-pale text-terracotta-dark"
                          : user.role === "seller"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-stone-100 text-stone-600"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-semibold text-stone-900">
                All Users ({users.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                      User
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Role
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Joined
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-terracotta-pale flex items-center justify-center font-semibold text-terracotta-dark text-sm flex-shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-stone-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-stone-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                          user.role === "admin"
                            ? "bg-terracotta-pale text-terracotta-dark"
                            : user.role === "seller"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-stone-100 text-stone-600"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${
                          user.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {user.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDeactivateUser(user._id, user.isActive)}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                              user.isActive
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {user.isActive
                              ? <><FiToggleRight size={13} /> Deactivate</>
                              : <><FiToggleLeft size={13} /> Activate</>
                            }
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LISTINGS TAB ── */}
        {activeTab === "listings" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900">
                All Listings ({listings.length})
              </h3>
            </div>
            <div className="divide-y divide-stone-50">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors"
                >
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-900 truncate mb-0.5">
                      {listing.title}
                    </div>
                    <div className="text-xs text-stone-500">
                      By {listing.seller?.name} · ₹{listing.price} · {listing.category}
                    </div>
                  </div>

                  {/* Status */}
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${
                    listing.status === "active"  ? "bg-green-50 text-green-700" :
                    listing.status === "sold"    ? "bg-blue-50 text-blue-700" :
                    listing.status === "expired" ? "bg-red-50 text-red-700" :
                    "bg-stone-100 text-stone-600"
                  }`}>
                    {listing.status}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/listings/${listing._id}`}
                      className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:text-terracotta hover:border-terracotta transition-all"
                    >
                      <FiEye size={14} />
                    </Link>
                    {listing.status === "active" && (
                      <button
                        onClick={() => handleRemoveListing(listing._id)}
                        className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:text-red-500 hover:border-red-300 transition-all"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900">
                Recent Orders
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    {["Item", "Buyer", "Seller", "Amount", "Payment", "Status"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                            {order.listing?.images?.[0] ? (
                              <img src={order.listing.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">👗</div>
                            )}
                          </div>
                          <span className="text-sm text-stone-900 truncate max-w-32">
                            {order.listing?.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {order.buyer?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {order.seller?.name}
                      </td>
                      <td className="px-6 py-4 font-serif text-stone-900">
                        ₹{order.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                          order.paymentStatus === "paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                          order.orderStatus === "completed" ? "bg-green-50 text-green-700" :
                          order.orderStatus === "shipped"   ? "bg-blue-50 text-blue-700" :
                          order.orderStatus === "confirmed" ? "bg-yellow-50 text-yellow-700" :
                          "bg-stone-100 text-stone-600"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}