"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="register-page">

      {/* ================= BACK HOME ================= */}

      <Link
        href="/"
        className="register-back-home"
      >
        ← Back to Home
      </Link>


      {/* ================= HEADER ================= */}

      <header className="register-header">

        <Link
          href="/"
          className="register-logo"
        >
          🌱 SmartAgri
        </Link>

      </header>


      {/* ================= CONTENT ================= */}

      <section className="register-wrapper">

        <div className="register-heading">

          <p>
            JOIN FARMDIRECT
          </p>

          <h1>
            Create Account
          </h1>

          <span>
            Choose how you want to use SmartAgri
          </span>

        </div>


        {/* ================= OPTIONS ================= */}

        <div className="register-options">


          {/* ================= FARMER ================= */}

          <div className="register-card farmer-card">

            <div className="register-card-icon">
              👨‍🌾
            </div>

            <div className="register-card-content">

              <span className="register-badge">
                FOR FARMERS
              </span>

              <h2>
                I'm a Farmer
              </h2>

              <p>
                Register your farm and sell your
                agricultural products directly to
                customers.
              </p>

              <Link
                href="/register/farmer"
                className="register-button"
              >
                Register as Farmer →
              </Link>

            </div>

          </div>


          {/* ================= CUSTOMER ================= */}

          <div className="register-card customer-card">

            <div className="register-card-icon">
              🛒
            </div>

            <div className="register-card-content">

              <span className="register-badge">
                FOR CUSTOMERS
              </span>

              <h2>
                I'm a Customer
              </h2>

              <p>
                Discover fresh agricultural products
                and buy directly from farmers.
              </p>

              <Link
                href="/register/customer"
                className="register-button"
              >
                Register as Customer →
              </Link>

            </div>

          </div>

        </div>


        {/* ================= LOGIN ================= */}

        <div className="register-login">

          <span>
            Already have an account?
          </span>

          <Link href="/login">
            Login
          </Link>

        </div>


        {/* ================= TRUST ================= */}

        <div className="register-trust">

          <span>🌱</span>

          <p>
            Connecting farmers directly with customers
          </p>

        </div>

      </section>

    </main>
  );
}