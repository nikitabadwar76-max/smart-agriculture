"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../lib/api";

export type AdminTab = "overview" | "customers" | "farmers" | "products" | "orders";

export interface Customer {
  customer_id: number;
  customer_name: string;
  mobile: string;
  address?: string | null;
  created_at?: string;
}

export interface Farmer {
  farmer_id: number;
  farmer_name: string;
  email: string;
  mobile?: string | null;
  location?: string | null;
  address?: string | null;
  status: string;
  created_at?: string;
}

export interface Product {
  product_id: number;
  farmer_id?: number;
  product_name: string;
  category: string;
  description?: string | null;
  price: string | number;
  unit: string;
  stock: string | number;
  image_url?: string | null;
  status: string;
  created_at?: string;
  farmer_name?: string | null;
  farmer_mobile?: string | null;
}

export interface Order {
  order_id: number;
  customer_id: number;
  customer_name?: string | null;
  customer_mobile?: string | null;
  customer_address?: string | null;
  total_amount: string | number;
  order_status: string;
  payment_status: string;
  payment_method?: string | null;
  delivery_address?: string | null;
  order_date?: string;
}

interface AdminDashboardProps {
  initialTab?: AdminTab;
}

export default function AdminDashboard({ initialTab = "overview" }: AdminDashboardProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Database Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Filters & Search
  const [customerSearch, setCustomerSearch] = useState("");
  const [farmerSearch, setFarmerSearch] = useState("");
  const [farmerStatusFilter, setFarmerStatusFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [custRes, farmRes, prodRes, ordRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/customers`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/api/farmers`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/api/products?all=true`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/api/orders`, { cache: "no-store" }),
      ]);

      if (custRes.status === "fulfilled" && custRes.value.ok) {
        const data = await custRes.value.json();
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
      }

      if (farmRes.status === "fulfilled" && farmRes.value.ok) {
        const data = await farmRes.value.json();
        setFarmers(Array.isArray(data.farmers) ? data.farmers : []);
      }

      if (prodRes.status === "fulfilled" && prodRes.value.ok) {
        const data = await prodRes.value.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      }

      if (ordRes.status === "fulfilled" && ordRes.value.ok) {
        const data = await ordRes.value.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Status Changer for Orders
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, order_status: newStatus } : o))
      );
      showNotice(`✅ Order #${orderId} status updated to ${newStatus}`);
    } catch (err: any) {
      alert(err.message || "Error updating status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Toggle Farmer Status
  const handleToggleFarmerStatus = async (farmerId: number, currentStatus: string) => {
    const nextStatus = currentStatus.toLowerCase() === "active" ? "inactive" : "active";
    if (!confirm(`Are you sure you want to change farmer #${farmerId} status to "${nextStatus}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/farmers/${farmerId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      setFarmers((prev) =>
        prev.map((f) => (f.farmer_id === farmerId ? { ...f, status: nextStatus } : f))
      );
      showNotice(`✅ Farmer #${farmerId} status changed to ${nextStatus}`);
    } catch (err: any) {
      alert(err.message || "Error toggling status");
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: number) => {
    if (!confirm(`Are you sure you want to remove customer #${id} from the database?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      setCustomers((prev) => prev.filter((c) => c.customer_id !== id));
      showNotice(`✅ Customer #${id} deleted successfully`);
    } catch (err: any) {
      alert(err.message || "Error deleting customer");
    }
  };

  // Delete Farmer
  const handleDeleteFarmer = async (id: number) => {
    if (!confirm(`Are you sure you want to remove farmer #${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/farmers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      setFarmers((prev) => prev.filter((f) => f.farmer_id !== id));
      showNotice(`✅ Farmer #${id} deleted successfully`);
    } catch (err: any) {
      alert(err.message || "Error deleting farmer");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm(`Are you sure you want to delete product #${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      setProducts((prev) => prev.filter((p) => p.product_id !== id));
      showNotice(`✅ Product #${id} deleted successfully`);
    } catch (err: any) {
      alert(err.message || "Error deleting product");
    }
  };

  // Delete Order
  const handleDeleteOrder = async (id: number) => {
    if (!confirm(`Are you sure you want to delete order #${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      setOrders((prev) => prev.filter((o) => o.order_id !== id));
      showNotice(`✅ Order #${id} deleted successfully`);
    } catch (err: any) {
      alert(err.message || "Error deleting order");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    router.push("/login");
  };

  // Filtered lists
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.customer_name?.toLowerCase().includes(q) ||
        c.mobile?.includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        String(c.customer_id).includes(q)
    );
  }, [customers, customerSearch]);

  const filteredFarmers = useMemo(() => {
    const q = farmerSearch.toLowerCase().trim();
    return farmers.filter((f) => {
      const matchesSearch =
        !q ||
        f.farmer_name?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.mobile?.includes(q) ||
        f.location?.toLowerCase().includes(q) ||
        String(f.farmer_id).includes(q);

      const matchesStatus =
        farmerStatusFilter === "all" ||
        f.status?.toLowerCase() === farmerStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [farmers, farmerSearch, farmerStatusFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.product_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.farmer_name?.toLowerCase().includes(q) ||
        String(p.product_id).includes(q);

      const matchesCat =
        productCategoryFilter === "all" ||
        p.category?.toLowerCase() === productCategoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.toLowerCase().trim();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        String(o.order_id).includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_mobile?.includes(q) ||
        o.delivery_address?.toLowerCase().includes(q);

      const matchesStatus =
        orderStatusFilter === "all" ||
        o.order_status?.toLowerCase() === orderStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Tab switch handler
  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-900 font-sans">
      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-bounce">
          <span className="text-xl">✨</span>
          <span className="text-sm font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================
          SIDEBAR NAVIGATION
      ========================== */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-2xl text-white shadow-md shadow-green-600/20">
            🌱
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">SmartAgri</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700">Admin Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Database Collections
          </p>

          <button
            onClick={() => switchTab("overview")}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === "overview"
                ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📊</span>
              Dashboard Overview
            </div>
          </button>

          <button
            onClick={() => switchTab("customers")}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === "customers"
                ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">👥</span>
              Customers
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                activeTab === "customers" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => switchTab("farmers")}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === "farmers"
                ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">👨‍🌾</span>
              Farmers
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                activeTab === "farmers" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {farmers.length}
            </span>
          </button>

          <button
            onClick={() => switchTab("products")}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === "products"
                ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🥬</span>
              Products
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                activeTab === "products" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => switchTab("orders")}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === "orders"
                ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📦</span>
              Orders
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                activeTab === "orders" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {orders.length}
            </span>
          </button>

          <div className="my-5 border-t border-gray-100 pt-5">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Quick Links
            </p>

            <Link
              href="/marketplace"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <span className="text-lg">🛒</span>
              Marketplace
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <span className="text-lg">🏠</span>
              Homepage
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <span className="text-lg">🚪</span>
              Logout
            </button>
          </div>
        </nav>

        {/* Profile Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-gray-200/80 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 font-extrabold text-white">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-gray-800 uppercase">Administrator</p>
              <p className="truncate text-[11px] text-gray-500 font-medium">MySQL DB Connected</p>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-green-100" />
          </div>
        </div>
      </aside>

      {/* =========================
          MAIN WRAPPER
      ========================== */}
      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/90 px-5 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-4">
            <button
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div>
              <h2 className="text-xl font-black text-gray-900 capitalize md:text-2xl flex items-center gap-2">
                {activeTab === "overview" && "📊 Platform Overview"}
                {activeTab === "customers" && "👥 Registered Customers"}
                {activeTab === "farmers" && "👨‍🌾 Verified Farmers"}
                {activeTab === "products" && "🥬 Marketplace Products"}
                {activeTab === "orders" && "📦 Customer Orders"}
              </h2>
              <p className="hidden text-xs text-gray-500 sm:block font-medium">
                Live database connectivity • smart_agriculture schema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-xs transition hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <span className={loading ? "animate-spin" : ""}>↻</span>
              {loading ? "Refreshing..." : "Refresh DB"}
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-lg">
              🛡️
            </div>
          </div>
        </header>

        {/* Tab Content Area */}
        <main className="p-5 md:p-8 flex-1">
          {/* ========================================================
              TAB 1: OVERVIEW
          ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Welcome Banner */}
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 p-7 text-white shadow-xl">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center relative z-10">
                  <div>
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-3">
                      Connected to MySQL
                    </span>
                    <h1 className="text-2xl font-black md:text-3xl">
                      Smart Agriculture Command Center 🌱
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100">
                      Real-time access to your database. Total platform revenue currently stands at{" "}
                      <span className="font-extrabold text-white underline decoration-yellow-400 underline-offset-4">
                        ₹{totalRevenue.toLocaleString()}
                      </span>{" "}
                      across {orders.length} orders.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => switchTab("orders")}
                      className="rounded-2xl bg-white px-5 py-3 text-xs font-black text-green-800 shadow-lg transition hover:bg-green-50 cursor-pointer"
                    >
                      View All Orders →
                    </button>
                    <button
                      onClick={() => switchTab("products")}
                      className="rounded-2xl bg-white/10 border border-white/30 backdrop-blur-md px-5 py-3 text-xs font-black text-white shadow-md transition hover:bg-white/20 cursor-pointer"
                    >
                      Manage Inventory
                    </button>
                  </div>
                </div>
              </section>

              {/* Stat Cards */}
              <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Customers"
                  value={loading ? "..." : customers.length}
                  subtitle="In customers table"
                  icon="👥"
                  onClick={() => switchTab("customers")}
                />
                <StatCard
                  title="Total Farmers"
                  value={loading ? "..." : farmers.length}
                  subtitle="In farmers table"
                  icon="👨‍🌾"
                  onClick={() => switchTab("farmers")}
                />
                <StatCard
                  title="Total Products"
                  value={loading ? "..." : products.length}
                  subtitle="In products table"
                  icon="🥬"
                  onClick={() => switchTab("products")}
                />
                <StatCard
                  title="Total Orders"
                  value={loading ? "..." : orders.length}
                  subtitle="In orders table"
                  icon="📦"
                  onClick={() => switchTab("orders")}
                />
              </section>

              {/* Quick Navigation Cards */}
              <section>
                <div className="mb-4">
                  <h3 className="text-lg font-black text-gray-900">Database Collections</h3>
                  <p className="text-xs text-gray-500">
                    Click any collection to inspect, filter, or manage database records.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <ManagementCard
                    icon="👥"
                    title="Customers"
                    count={`${customers.length} Accounts`}
                    description="View registered buyers, phone numbers, delivery addresses, and sign-up dates."
                    button="Inspect Customers"
                    onClick={() => switchTab("customers")}
                  />
                  <ManagementCard
                    icon="👨‍🌾"
                    title="Farmers"
                    count={`${farmers.length} Registered`}
                    description="Inspect farmer credentials, status (active/inactive), contact numbers, and locations."
                    button="Inspect Farmers"
                    onClick={() => switchTab("farmers")}
                  />
                  <ManagementCard
                    icon="🥕"
                    title="Products"
                    count={`${products.length} Items`}
                    description="Inspect product prices, categories, inventory stock, and associated farmer suppliers."
                    button="Inspect Products"
                    onClick={() => switchTab("products")}
                  />
                  <ManagementCard
                    icon="📦"
                    title="Orders"
                    count={`${orders.length} Placed`}
                    description="Update order fulfillment status (Pending, Confirmed, Shipped, Delivered) in real-time."
                    button="Inspect Orders"
                    onClick={() => switchTab("orders")}
                  />
                </div>
              </section>

              {/* Lower Section: Live Activity & Health */}
              <section className="grid gap-6 xl:grid-cols-3">
                {/* Recent Orders Preview */}
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs xl:col-span-2">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-gray-900">Latest Database Orders</h3>
                      <p className="text-xs text-gray-500">Most recent customer purchases from MySQL</p>
                    </div>
                    <button
                      onClick={() => switchTab("orders")}
                      className="text-xs font-bold text-green-700 hover:underline cursor-pointer"
                    >
                      View All ({orders.length}) →
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.order_id}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 rounded-xl px-2 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 font-extrabold text-sm">
                            #{order.order_id}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {order.customer_name || `Customer #${order.customer_id}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.order_date
                                ? new Date(order.order_date).toLocaleString()
                                : "Recent"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-gray-900">
                            ₹{Number(order.total_amount).toFixed(2)}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                              order.order_status?.toLowerCase() === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.order_status?.toLowerCase() === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    ))}

                    {orders.length === 0 && (
                      <p className="py-6 text-center text-xs text-gray-400">No orders recorded in database yet.</p>
                    )}
                  </div>
                </div>

                {/* System Status */}
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-gray-900">Database Status</h3>
                    <p className="text-xs text-gray-500">System infrastructure health</p>

                    <div className="mt-5 space-y-3">
                      <StatusRow title="MySQL Server" status="Connected" />
                      <StatusRow title="Backend API (Express)" status="Port 5000 Active" />
                      <StatusRow title="Next.js Frontend" status="Running" />
                      <StatusRow title="Orders Collection" status={`${orders.length} Records`} />
                      <StatusRow title="Inventory Catalog" status={`${products.length} Products`} />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-green-50 p-4 border border-green-100">
                    <p className="text-xs font-bold text-green-900 flex items-center gap-1.5">
                      <span>🌱</span> Live Synchronized
                    </p>
                    <p className="text-[11px] text-green-700 mt-1 leading-relaxed">
                      Changes made from this dashboard directly modify tables in your MySQL database.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================
              TAB 2: CUSTOMERS
          ========================================================= */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Customers Table</h3>
                  <p className="text-xs text-gray-500">
                    Showing {filteredCustomers.length} of {customers.length} registered customers
                  </p>
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search by name, phone, or ID..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Customer Name</th>
                        <th className="px-6 py-4">Mobile Number</th>
                        <th className="px-6 py-4">Default Address</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredCustomers.map((c) => (
                        <tr key={c.customer_id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 font-mono font-bold text-gray-400">
                            #{c.customer_id}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-800 text-xs font-black">
                              {c.customer_name?.[0]?.toUpperCase() || "C"}
                            </span>
                            {c.customer_name}
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-600">{c.mobile}</td>
                          <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                            {c.address || <span className="text-gray-300 italic">Not specified</span>}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-[11px]">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteCustomer(c.customer_id)}
                              className="text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                            No customers found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: FARMERS
          ========================================================= */}
          {activeTab === "farmers" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Farmers Table</h3>
                  <p className="text-xs text-gray-500">
                    Showing {filteredFarmers.length} of {farmers.length} registered farmers
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={farmerStatusFilter}
                    onChange={(e) => setFarmerStatusFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Search farmers..."
                    value={farmerSearch}
                    onChange={(e) => setFarmerSearch(e.target.value)}
                    className="w-full sm:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Farmer Details</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Registered</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredFarmers.map((f) => (
                        <tr key={f.farmer_id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 font-mono font-bold text-gray-400">
                            #{f.farmer_id}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{f.farmer_name}</p>
                            <p className="text-[11px] text-gray-400">{f.email}</p>
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-600">
                            {f.mobile || <span className="text-gray-300 italic">—</span>}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {f.location || f.address || <span className="text-gray-300 italic">Not set</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                f.status?.toLowerCase() === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {f.status || "active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-[11px]">
                            {f.created_at ? new Date(f.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-6 py-4 text-right space-x-3">
                            <button
                              onClick={() => handleToggleFarmerStatus(f.farmer_id, f.status)}
                              className="font-bold text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {f.status?.toLowerCase() === "active" ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDeleteFarmer(f.farmer_id)}
                              className="font-bold text-xs text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredFarmers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            No farmers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: PRODUCTS
          ========================================================= */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Products Catalog</h3>
                  <p className="text-xs text-gray-500">
                    Showing {filteredProducts.length} of {products.length} products across all categories
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full sm:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Farmer</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredProducts.map((p) => (
                        <tr key={p.product_id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 flex items-center gap-3">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.product_name}
                                className="h-10 w-10 rounded-xl object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
                                🥬
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900">{p.product_name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">#{p.product_id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-black text-gray-900">
                            ₹{Number(p.price).toFixed(2)} <span className="text-gray-400 text-[10px]">/{p.unit}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-bold ${
                                Number(p.stock) <= 0 ? "text-red-600" : "text-gray-700"
                              }`}
                            >
                              {p.stock} {p.unit}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-semibold text-gray-800">
                              {p.farmer_name || `Farmer #${p.farmer_id}`}
                            </p>
                            {p.farmer_mobile && (
                              <p className="text-[10px] text-gray-400 font-mono">{p.farmer_mobile}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                p.status === "available" && Number(p.stock) > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.product_id)}
                              className="font-bold text-xs text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            No products found matching your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: ORDERS
          ========================================================= */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Orders Table</h3>
                  <p className="text-xs text-gray-500">
                    Showing {filteredOrders.length} of {orders.length} orders • Total Revenue: ₹
                    {totalRevenue.toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Search by ID, customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full sm:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Total Amount</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Delivery Address</th>
                        <th className="px-6 py-4">Order Date</th>
                        <th className="px-6 py-4">Live Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredOrders.map((o) => (
                        <tr key={o.order_id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 font-mono font-black text-green-700">
                            #FD{String(o.order_id).padStart(5, "0")}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">
                              {o.customer_name || `Customer #${o.customer_id}`}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              {o.customer_mobile || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4 font-black text-gray-900 text-sm">
                            ₹{Number(o.total_amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-semibold text-gray-800">
                              {o.payment_method || "Cash on Delivery"}
                            </p>
                            <span
                              className={`text-[10px] font-extrabold uppercase ${
                                o.payment_status?.toLowerCase() === "paid"
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {o.payment_status || "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                            {o.delivery_address || o.customer_address || "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-[11px]">
                            {o.order_date ? new Date(o.order_date).toLocaleString() : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={o.order_status}
                              disabled={updatingOrderId === o.order_id}
                              onChange={(e) => handleUpdateOrderStatus(o.order_id, e.target.value)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border outline-none cursor-pointer transition ${
                                o.order_status?.toLowerCase() === "delivered"
                                  ? "bg-green-50 text-green-800 border-green-200"
                                  : o.order_status?.toLowerCase() === "cancelled"
                                  ? "bg-red-50 text-red-800 border-red-200"
                                  : o.order_status?.toLowerCase() === "shipped"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-yellow-50 text-yellow-800 border-yellow-200"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteOrder(o.order_id)}
                              className="font-bold text-xs text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                            No orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* =========================================
   REUSABLE STAT CARD
========================================= */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md hover:border-green-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-black text-gray-900">{value}</p>
          <p className="mt-1 text-[11px] text-gray-400 font-medium">{subtitle}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl transition group-hover:scale-110">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   MANAGEMENT CARD
========================================= */
function ManagementCard({
  icon,
  title,
  count,
  description,
  button,
  onClick,
}: {
  icon: string;
  title: string;
  count: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl">
            {icon}
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
            {count}
          </span>
        </div>

        <h4 className="mt-5 text-base font-black text-gray-900">{title}</h4>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
      </div>

      <button
        onClick={onClick}
        className="mt-5 w-full rounded-xl bg-gray-50 px-4 py-2.5 text-xs font-bold text-green-700 transition hover:bg-green-600 hover:text-white cursor-pointer"
      >
        {button} →
      </button>
    </div>
  );
}

/* =========================================
   STATUS ROW
========================================= */
function StatusRow({ title, status }: { title: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 bg-gray-50/50">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-xs font-bold text-gray-700">{title}</span>
      </div>
      <span className="text-xs font-black text-green-700">{status}</span>
    </div>
  );
}
