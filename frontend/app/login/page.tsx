"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

type UserRole = "customer" | "farmer";
export default function LoginPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!mobile.trim() || !password.trim()) {
      alert("Please enter mobile number/credentials and password.");
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

      if (data.customer) {
        if (data.customer.customer_id) {
          localStorage.setItem(
            "customer_id",
            String(data.customer.customer_id)
          );
        }

        if (data.customer.customer_name) {
          localStorage.setItem(
            "customer_name",
            data.customer.customer_name
          );
        }

        if (data.customer.mobile) {
          localStorage.setItem(
            "customer_mobile",
            data.customer.mobile
          );
        }
      }

      alert("✅ Login successful!");

      router.push("/marketplace");
    } catch (error: any) {
      console.error("Login Error:", error);

      alert(
        error?.message || "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 px-4 flex flex-col justify-center items-center">
      <Link href="/" className="mb-6 text-green-700 font-semibold hover:underline flex items-center gap-2">
        ← Back to Home
      </Link>

      <header className="login-header">
        <Link href="/" className="login-logo">
          🌱 SmartAgri
        </Link>

        <div className="login-header-icon">🔐</div>
      </header>

      <section className="login-wrapper">
        <div className="login-card">
          <div className="login-icon">🔐</div>

          <div className="login-title">
            <p>WELCOME BACK</p>

            <h1>Welcome Back</h1>

            <span>
              Login to your SmartAgri account.
            </span>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label htmlFor="mobile">
                Mobile Number
              </label>

              <div className="login-input-wrapper">
                <span>📱</span>

                <input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter mobile number"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">
                <span>🔒</span>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <div className="login-options">
              <Link href="/login">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? "⏳ Logging in..." : "Login →"}
            </button>
          </form>

          <div className="login-register">
            <span>Don't have an account?</span>

            <Link href="/register/customer">
              Create Account
            </Link>
          </div>
        </div>

        <div className="login-trust">
          <span>🌱</span>

          <p>
            Fresh products directly from local farmers
          </p>
        </div>
      </section>
    </main>
  );
}