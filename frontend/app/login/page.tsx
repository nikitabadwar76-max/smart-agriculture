"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

type UserRole = "customer" | "farmer";
export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("customer");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!mobile.trim() || !password.trim()) {
      alert("Please enter mobile number and password.");
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

      // =====================================================
      // CUSTOMER LOGIN
      // =====================================================

      if (role === "customer") {
        if (data.userType !== "customer" || !data.customer) {
          throw new Error(
            "This mobile number is not registered as a customer."
          );
        }

        const customer = data.customer;

        localStorage.setItem(
          "user_role",
          "customer"
        );

        localStorage.setItem(
          "customer_id",
          String(customer.customer_id)
        );

        localStorage.setItem(
          "customer_name",
          customer.customer_name || ""
        );

        localStorage.setItem(
          "customer_mobile",
          customer.mobile || ""
        );

        alert("✅ Customer login successful!");

        router.push("/marketplace");
        return;
      }

      // =====================================================
      // FARMER LOGIN
      // =====================================================

      if (role === "farmer") {
        if (data.userType !== "farmer" || !data.farmer) {
          throw new Error(
            "This mobile number is not registered as a farmer."
          );
        }

        const farmer = data.farmer;

        localStorage.setItem(
          "user_role",
          "farmer"
        );

        localStorage.setItem(
          "farmer_id",
          String(farmer.farmer_id)
        );

        localStorage.setItem(
          "farmer_name",
          farmer.farmer_name || ""
        );

        localStorage.setItem(
          "farmer_email",
          farmer.email || ""
        );

        localStorage.setItem(
          "farmer_mobile",
          farmer.mobile || ""
        );

        localStorage.setItem(
          "farmer_location",
          farmer.location || ""
        );

        localStorage.setItem(
          "farmer_address",
          farmer.address || ""
        );

        alert("✅ Farmer login successful!");

        router.push("/farmer/products");
        return;
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      alert(
        error?.message ||
          "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <Link href="/" className="login-back-home">
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

          {/* ROLE SELECTION */}

          <div className="login-role-section">
            <label>Login As</label>

            <div className="login-role-buttons">

              <button
                type="button"
                onClick={() => setRole("customer")}
                className={
                  role === "customer"
                    ? "login-role-button active"
                    : "login-role-button"
                }
              >
                👤 Customer
              </button>

              <button
                type="button"
                onClick={() => setRole("farmer")}
                className={
                  role === "farmer"
                    ? "login-role-button active"
                    : "login-role-button"
                }
              >
                👨‍🌾 Farmer
              </button>

            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="login-form"
          >

            {/* MOBILE */}

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
                  onChange={(e) =>
                    setMobile(e.target.value)
                  }
                  placeholder="Enter mobile number"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}

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
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
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
              {loading
                ? "⏳ Logging in..."
                : `Login as ${
                    role === "customer"
                      ? "Customer"
                      : "Farmer"
                  } →`}
            </button>

          </form>

          {/* REGISTER */}

          <div className="login-register">
            <span>
              Don't have an account?
            </span>

            {role === "customer" ? (
              <Link href="/register/customer">
                Create Customer Account
              </Link>
            ) : (
              <Link href="/register/farmer">
                Create Farmer Account
              </Link>
            )}
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