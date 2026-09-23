"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
};

type Activity = {
  title: string;
  description: string;
  time: string;
  icon: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    customers: 0,
    farmers: 0,
    products: 0,
    orders: 0,
  });

  const [activities, setActivities] = useState<Activity[]>([]);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      /*
       * Products API is already available in your SmartAgri backend.
       * The other APIs are attempted only if they exist.
       */

      let customers = 0;
      let farmers = 0;
      let products = 0;
      let orders = 0;

      // Products
      try {
        const response = await fetch(`${API_URL}/api/products`);

        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data)) {
            products = data.length;
          } else if (Array.isArray(data.products)) {
            products = data.products.length;
          }
        }
      } catch (error) {
        console.log("Products API unavailable");
      }

      // Customers
      try {
        const response = await fetch(`${API_URL}/api/customers`);

        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data)) {
            customers = data.length;
          } else if (Array.isArray(data.customers)) {
            customers = data.customers.length;
          }
        }
      } catch (error) {
        console.log("Customers API unavailable");
      }

      // Farmers
      try {
        const response = await fetch(`${API_URL}/api/farmers`);

        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data)) {
            farmers = data.length;
          } else if (Array.isArray(data.farmers)) {
            farmers = data.farmers.length;
          }
        }
      } catch (error) {
        console.log("Farmers API unavailable");
      }

      // Orders
      try {
        const response = await fetch(`${API_URL}/api/orders`);

        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data)) {
            orders = data.length;
          } else if (Array.isArray(data.orders)) {
            orders = data.orders.length;
          }
        }
      } catch (error) {
        console.log("Orders API unavailable");
      }

      setStats({
        customers,
        farmers,
        products,
        orders,
      });

      setActivities([
        {
          title: "Admin dashboard opened",
          description: "SmartAgri system is ready to manage.",
          time: "Just now",
          icon: "📊",
        },
        {
          title: "Product inventory checked",
          description: `${products} products currently available.`,
          time: "Today",
          icon: "🥬",
        },
        {
          title: "Farmer marketplace",
          description: `${farmers} registered farmers.`,
          time: "Today",
          icon: "👨‍🌾",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");

    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-gray-900">

      {/* =========================
          MOBILE OVERLAY
      ========================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================
          SIDEBAR
      ========================== */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72
          bg-white border-r border-gray-200
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-2xl shadow-sm">
            🌱
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
              SmartAgri
            </h1>

            <p className="text-xs font-medium text-gray-500">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">

          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <button
            className="mb-1 flex w-full items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700"
            onClick={() => router.push("/admin")}
          >
            <span className="text-lg">📊</span>
            Dashboard
          </button>

          <button
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-green-700"
            onClick={() => router.push("/admin/customers")}
          >
            <span className="text-lg">👥</span>
            Customers
          </button>

          <button
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-green-700"
            onClick={() => router.push("/admin/farmers")}
          >
            <span className="text-lg">👨‍🌾</span>
            Farmers
          </button>

          <button
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-green-700"
            onClick={() => router.push("/admin/products")}
          >
            <span className="text-lg">🥬</span>
            Products
          </button>

          <button
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-green-700"
            onClick={() => router.push("/admin/orders")}
          >
            <span className="text-lg">📦</span>
            Orders
          </button>

          <div className="my-6 border-t border-gray-100" />

          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            System
          </p>

          <button
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-green-700"
            onClick={() => router.push("/")}
          >
            <span className="text-lg">🏠</span>
            View Website
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
            onClick={handleLogout}
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </nav>

        {/* Admin profile */}
        <div className="absolute bottom-5 left-4 right-4">
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 font-bold text-white">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-800">
                  Administrator
                </p>

                <p className="truncate text-xs text-gray-500">
                  System Manager
                </p>
              </div>

              <div className="ml-auto h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main className="lg:ml-72">

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-5 backdrop-blur md:px-8">

          <div className="flex items-center gap-4">

            <button
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div>
              <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">
                Dashboard
              </h2>

              <p className="hidden text-sm text-gray-500 sm:block">
                Welcome back, Administrator 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={loadDashboardData}
              className="hidden rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:block"
            >
              ↻ Refresh
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
              👨‍💼
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-5 md:p-8">

          {/* Welcome Banner */}
          <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-lg md:p-8">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-100">
                  Smart Agriculture Management System
                </p>

                <h1 className="text-2xl font-extrabold md:text-4xl">
                  Manage Your FarmDirect Platform 🌱
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-green-50 md:text-base">
                  Monitor farmers, customers, products and orders
                  from one centralized dashboard.
                </p>
              </div>

              <button
                onClick={() => router.push("/marketplace")}
                className="w-fit rounded-xl bg-white px-5 py-3 text-sm font-bold text-green-700 shadow-md transition hover:bg-green-50"
              >
                View Marketplace →
              </button>
            </div>
          </section>

          {/* =========================
              STAT CARDS
          ========================== */}
          <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Customers"
              value={loading ? "..." : stats.customers}
              subtitle="Registered customers"
              icon="👥"
            />

            <StatCard
              title="Total Farmers"
              value={loading ? "..." : stats.farmers}
              subtitle="Registered farmers"
              icon="👨‍🌾"
            />

            <StatCard
              title="Total Products"
              value={loading ? "..." : stats.products}
              subtitle="Marketplace products"
              icon="🥬"
            />

            <StatCard
              title="Total Orders"
              value={loading ? "..." : stats.orders}
              subtitle="Orders placed"
              icon="📦"
            />

          </section>

          {/* =========================
              MANAGEMENT CARDS
          ========================== */}
          <section className="mb-8">

            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-gray-900">
                Quick Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage important areas of your SmartAgri platform.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              <ManagementCard
                icon="👥"
                title="Customers"
                description="View and manage registered customers."
                button="Manage Customers"
                onClick={() => router.push("/admin/customers")}
              />

              <ManagementCard
                icon="👨‍🌾"
                title="Farmers"
                description="Monitor farmers and their marketplace activity."
                button="Manage Farmers"
                onClick={() => router.push("/admin/farmers")}
              />

              <ManagementCard
                icon="🥕"
                title="Products"
                description="Review products available in the marketplace."
                button="Manage Products"
                onClick={() => router.push("/admin/products")}
              />

              <ManagementCard
                icon="📦"
                title="Orders"
                description="Monitor customer orders and order status."
                button="Manage Orders"
                onClick={() => router.push("/admin/orders")}
              />

            </div>
          </section>

          {/* =========================
              LOWER SECTION
          ========================== */}
          <section className="grid gap-6 xl:grid-cols-3">

            {/* Activity */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">
                    Recent Activity
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Latest system activity
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  Live
                </span>

              </div>

              <div className="space-y-4">

                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                      {activity.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800">
                        {activity.title}
                      </p>

                      <p className="truncate text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>

                    <span className="hidden text-xs font-medium text-gray-400 sm:block">
                      {activity.time}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            {/* System Status */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-extrabold text-gray-900">
                System Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                SmartAgri platform health
              </p>

              <div className="mt-6 space-y-4">

                <StatusRow
                  title="Frontend"
                  status="Online"
                />

                <StatusRow
                  title="Backend API"
                  status="Online"
                />

                <StatusRow
                  title="Database"
                  status="Connected"
                />

                <StatusRow
                  title="Marketplace"
                  status="Active"
                />

              </div>

              <div className="mt-6 rounded-xl bg-green-50 p-4">
                <div className="flex gap-3">
                  <span className="text-xl">🌱</span>

                  <div>
                    <p className="text-sm font-bold text-green-800">
                      SmartAgri is running
                    </p>

                    <p className="mt-1 text-xs leading-5 text-green-700">
                      Your agricultural marketplace is ready
                      for management.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Footer */}
          <footer className="mt-10 border-t border-gray-200 pt-6 text-center">

            <p className="text-sm text-gray-500">
              © 2026 SmartAgri — Fresh. Local. Direct.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Smart Agriculture Management System
            </p>

          </footer>

        </div>
      </main>
    </div>
  );
}


/* =========================================
   STAT CARD
========================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl transition group-hover:scale-110">
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
  description,
  button,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
        {description}
      </p>

      <button
        onClick={onClick}
        className="mt-5 w-full rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-green-700 transition hover:bg-green-600 hover:text-white"
      >
        {button} →
      </button>

    </div>
  );
}


/* =========================================
   STATUS ROW
========================================= */

function StatusRow({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">

      <div className="flex items-center gap-3">

        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />

          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
        </span>

        <span className="text-sm font-semibold text-gray-700">
          {title}
        </span>

      </div>

      <span className="text-xs font-bold text-green-600">
        {status}
      </span>

    </div>
  );
}