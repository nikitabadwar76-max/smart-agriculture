"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const API_URL = `${API_BASE_URL}/api/customers/register`;

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    customer_name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.customer_name.trim() ||
      !form.mobile.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.mobile.trim().length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: form.customer_name.trim(),
          mobile: form.mobile.trim(),
          password: form.password,
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
        throw new Error(data.message || "Registration failed.");
      }

      setMessage("Account created successfully! Redirecting to login...");

      setForm({
        customer_name: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error("Registration Error:", error);
      setError(
        error?.message || "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      
      {/* Decorative background glow circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10">

        {/* Back Link Pill */}
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md border border-white/15 transition-all duration-200 hover:-translate-x-0.5 shadow-sm"
          >
            <span>←</span>
            <span>Back to Login</span>
          </Link>

          <Link
            href="/"
            className="text-xs text-green-200 hover:text-white transition-colors"
          >
            Go to Homepage →
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-green-950/40 border border-white/40 p-7 sm:p-10 transition-all">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-400 text-white shadow-lg shadow-green-600/30 mb-3 text-2xl">
              🌱
            </div>

            <div className="inline-block px-3 py-1 bg-green-100/80 text-green-800 text-[11px] font-extrabold uppercase tracking-widest rounded-full mb-2">
              SmartAgri Customer
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Create Account
            </h1>

            <p className="text-sm text-gray-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Join <span className="font-semibold text-green-700">SmartAgri</span> and shop fresh, organic products directly from local farmers.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50/90 border border-red-200/80 text-red-700 text-sm flex items-start gap-3 animate-fadeIn">
              <span className="text-lg leading-none mt-0.5">⚠️</span>
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-sm flex items-start gap-3 animate-fadeIn">
              <span className="text-lg leading-none mt-0.5">✅</span>
              <div className="flex-1 font-medium">{message}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
            
            {/* Full Name */}
            <div>
              <label
                htmlFor="customer_name"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
              >
                Full Name <span className="text-emerald-600">*</span>
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 text-base pointer-events-none">
                  👤
                </span>
                <input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-gray-900 text-sm rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/15 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobile"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex justify-between items-center"
              >
                <span>
                  Mobile Number <span className="text-emerald-600">*</span>
                </span>
                <span className="text-[10px] text-gray-400 font-normal">
                  10 digits
                </span>
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 text-base pointer-events-none">
                  📱
                </span>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-gray-900 text-sm rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/15 outline-none transition-all placeholder:text-gray-400 font-mono text-sm tracking-wide"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
              >
                Password <span className="text-emerald-600">*</span>
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 text-base pointer-events-none">
                  🔒
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                  className="w-full pl-11 pr-11 py-3.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-gray-900 text-sm rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/15 outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 text-sm p-1 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex justify-between items-center"
              >
                <span>
                  Confirm Password <span className="text-emerald-600">*</span>
                </span>
                {form.confirmPassword && (
                  <span
                    className={`text-[10px] font-bold ${
                      form.password === form.confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {form.password === form.confirmPassword
                      ? "✓ Match"
                      : "✕ Mismatch"}
                  </span>
                )}
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 text-base pointer-events-none">
                  🛡️
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-type your password"
                  minLength={6}
                  required
                  className="w-full pl-11 pr-11 py-3.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-gray-900 text-sm rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/15 outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 text-sm p-1 transition"
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 px-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-xl shadow-green-600/30 hover:shadow-green-600/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span>Creating Your Account...</span>
                </>
              ) : (
                <span>Create Account →</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-green-700 hover:text-green-800 hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>

            <p className="text-xs text-gray-500">
              Are you a farmer?{" "}
              <Link
                href="/register/farmer"
                className="font-semibold text-emerald-700 hover:underline"
              >
                Register as Farmer instead 👨‍🌾
              </Link>
            </p>
          </div>

        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs text-green-100/80">
          <div className="flex items-center gap-1.5">
            <span>🌿</span> 100% Direct from Farmers
          </div>
          <div className="flex items-center gap-1.5">
            <span>⚡</span> Fresh & Fast Delivery
          </div>
          <div className="flex items-center gap-1.5">
            <span>🔒</span> Secure Platform
          </div>
        </div>

      </div>
    </main>
  );
}
