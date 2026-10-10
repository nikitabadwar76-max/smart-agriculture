"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

type UserRole = "customer" | "farmer" | "admin";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("customer");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!mobile.trim() || !password.trim()) {
      alert("Please enter " + (role === "admin" ? "username" : "mobile number") + " and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: mobile.trim(),
          password,
          role,
        }),
      });

      const text = await response.text();
      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned an invalid response. Status: ${response.status}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // =====================================================
      // 1. ADMIN LOGIN -> ADMIN DASHBOARD
      // =====================================================
      if (role === "admin" || data.userType === "admin") {
        localStorage.setItem("user_role", "admin");
        localStorage.setItem("admin", "true");
        localStorage.setItem("adminToken", data.token || "admin_session");
        alert("✅ Admin login successful!");
        router.push("/admin");
        return;
      }

      // =====================================================
      // 2. FARMER LOGIN -> ADD/EDIT/REMOVE PRODUCTS
      // =====================================================
      if (role === "farmer" || data.userType === "farmer") {
        localStorage.setItem("user_role", "farmer");
        if (data.farmer) {
          localStorage.setItem("farmer_id", String(data.farmer.farmer_id));
          localStorage.setItem("farmer_name", data.farmer.farmer_name || "");
          localStorage.setItem("farmer_email", data.farmer.email || "");
          localStorage.setItem("farmer_mobile", data.farmer.mobile || "");
          localStorage.setItem("farmer_location", data.farmer.location || "");
          localStorage.setItem("farmer_address", data.farmer.address || "");
        }
        alert("✅ Farmer login successful!");
        router.push("/farmer/products");
        return;
      }

      // =====================================================
      // 3. CUSTOMER LOGIN -> VIEW PRODUCTS / CART / CHECKOUT
      // =====================================================
      localStorage.setItem("user_role", "customer");
      if (data.customer) {
        localStorage.setItem("customer_id", String(data.customer.customer_id));
        localStorage.setItem("customer_name", data.customer.customer_name || "");
        localStorage.setItem("customer_mobile", data.customer.mobile || "");
      }
      alert("✅ Customer login successful!");
      router.push("/marketplace");
    } catch (error: any) {
      console.error("Login Error:", error);
      alert(error?.message || "Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3fbf6] py-10 px-4 flex flex-col justify-center items-center font-sans">
      <Link
        href="/"
        className="mb-6 text-gray-700 font-medium hover:text-green-700 flex items-center gap-1.5 text-sm transition"
      >
        ← Back to Home
      </Link>

      <section className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-green-900/5 p-8 border border-gray-100 flex flex-col items-center">
        {/* User Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl text-purple-700 mb-3">
          {role === "customer" && "👤"}
          {role === "farmer" && "👨‍🌾"}
          {role === "admin" && "🛡️"}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {role === "customer" && "Customer Login"}
          {role === "farmer" && "Farmer Login"}
          {role === "admin" && "Admin Login"}
        </h1>
        <p className="text-xs text-gray-400 mt-1 mb-6 text-center">
          Choose your role and enter your credentials
        </p>

        {/* Role Selector Tabs (Customer, Farmer, Admin) */}
        <div className="w-full grid grid-cols-3 gap-2 bg-gray-50/80 p-1.5 rounded-2xl mb-6 border border-gray-100">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              role === "customer"
                ? "bg-green-600 text-white shadow-md shadow-green-600/30"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <span>👤</span>
            Customer
          </button>

          <button
            type="button"
            onClick={() => setRole("farmer")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              role === "farmer"
                ? "bg-green-600 text-white shadow-md shadow-green-600/30"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <span>👨‍🌾</span>
            Farmer
          </button>

          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              role === "admin"
                ? "bg-green-600 text-white shadow-md shadow-green-600/30"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <span>🛡️</span>
            Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
              {role === "admin" ? "Username or Mobile" : "Mobile Number"}
            </label>
            <div className="flex items-center gap-2.5 bg-[#f0f5ff] border border-blue-100 rounded-xl px-3.5 py-2.5 focus-within:border-green-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500/20 transition">
              <span className="text-gray-500 text-sm">
                {role === "admin" ? "🛡️" : "📱"}
              </span>
              <input
                type={role === "admin" ? "text" : "tel"}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder={
                  role === "admin"
                    ? "Enter admin username"
                    : "Enter 10-digit mobile number"
                }
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
              Password
            </label>
            <div className="flex items-center gap-2.5 bg-[#f0f5ff] border border-blue-100 rounded-xl px-3.5 py-2.5 focus-within:border-green-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500/20 transition">
              <span className="text-gray-500 text-sm">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white py-3 text-sm font-extrabold shadow-lg shadow-green-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            {loading
              ? "⏳ Logging in..."
              : `Login as ${
                  role === "customer"
                    ? "CUSTOMER"
                    : role === "farmer"
                    ? "FARMER"
                    : "ADMIN"
                } →`}
          </button>
        </form>

        {/* Registration Links */}
        <div className="mt-6 text-center text-xs text-gray-500">
          {role === "customer" && (
            <>
              Don't have a customer account?{" "}
              <Link
                href="/register/customer"
                className="font-bold text-green-700 hover:underline"
              >
                Register as Customer
              </Link>
            </>
          )}

          {role === "farmer" && (
            <>
              Don't have a farmer account?{" "}
              <Link
                href="/farmer/register"
                className="font-bold text-green-700 hover:underline"
              >
                Register as Farmer
              </Link>
            </>
          )}

          {role === "admin" && (
            <span className="text-gray-400">
              Admin portal for SmartAgri managers
            </span>
          )}
        </div>
      </section>
    </main>
  );
}