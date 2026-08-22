"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobile || !password) {
      alert("Please enter mobile number and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile,
            password,
          }),
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned invalid response. Status: ${response.status}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      // Save customer information
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
      console.error("❌ Login Error:", error);

      alert(
        error.message ||
          "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      {/* BACK TO HOME */}

      <Link
        href="/"
        className="login-back-home"
      >
        ← Back to Home
      </Link>


      {/* HEADER */}

      <header className="login-header">

        <Link
          href="/"
          className="login-logo"
        >
          🌱 FarmDirect
        </Link>

        <div className="login-header-icon">
          🔐
        </div>

      </header>


      {/* LOGIN CARD */}

      <section className="login-wrapper">

        <div className="login-card">

          {/* ICON */}

          <div className="login-icon">
            🔐
          </div>


          {/* TITLE */}

          <div className="login-title">

            <p>
              WELCOME BACK
            </p>

            <h1>
              Welcome Back
            </h1>

            <span>
              Login to your FarmDirect account.
            </span>

          </div>


          {/* FORM */}

          <form
            onSubmit={handleLogin}
            className="login-form"
          >

            {/* MOBILE */}

            <div className="login-field">

              <label>
                Mobile Number
              </label>

              <div className="login-input-wrapper">

                <span>
                  📱
                </span>

                <input
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

              <label>
                Password
              </label>

              <div className="login-input-wrapper">

                <span>
                  🔒
                </span>

                <input
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


            {/* FORGOT PASSWORD */}

            <div className="login-options">

              <Link href="/login#">
                Forgot Password?
              </Link>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >

              {loading
                ? "⏳ Logging in..."
                : "Login →"}

            </button>

          </form>


          {/* REGISTER */}

          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <Link href="/register">
              Create Account
            </Link>

          </div>

        </div>


        {/* TRUST */}

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