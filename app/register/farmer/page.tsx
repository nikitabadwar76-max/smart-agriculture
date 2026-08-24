"use client";

import { useState } from "react";

export default function FarmerRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    farmName: "",
    farmLocation: "",
    farmAddress: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      console.log("Farmer Registration:", form);

      // Backend connection can be added here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Farmer registration successful!");

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        farmName: "",
        farmLocation: "",
        farmAddress: "",
      });
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="farmer-register-page">

      {/* Background Decoration */}
      <div className="bg-circle circle-one"></div>
      <div className="bg-circle circle-two"></div>

      <div className="farmer-register-wrapper">

        {/* LEFT INFORMATION PANEL */}
        <section className="farmer-info-panel">

          <a href="/register" className="back-link">
            ← Back
          </a>

          <div className="brand">
            <div className="brand-icon">🌱</div>
            <span>SmartAgri</span>
          </div>

          <div className="farmer-illustration">
            👨‍🌾
          </div>

          <h1>
            Grow Your Business
            <span> With SmartAgri</span>
          </h1>

          <p>
            Join our agricultural marketplace and sell your
            fresh farm products directly to customers.
          </p>

          <div className="benefits">

            <div className="benefit">
              <div className="benefit-icon">🌾</div>
              <div>
                <h3>Sell Your Products</h3>
                <p>List and sell your farm products online.</p>
              </div>
            </div>

            <div className="benefit">
              <div className="benefit-icon">🛒</div>
              <div>
                <h3>Reach Customers</h3>
                <p>Connect directly with customers.</p>
              </div>
            </div>

            <div className="benefit">
              <div className="benefit-icon">📦</div>
              <div>
                <h3>Manage Orders</h3>
                <p>Manage your products and orders easily.</p>
              </div>
            </div>

          </div>

        </section>

        {/* REGISTRATION FORM */}
        <section className="farmer-form-panel">

          <div className="form-heading">

            <div className="mobile-brand">
              🌱 SmartAgri
            </div>

            <h2>Farmer Registration</h2>

            <p>
              Create your farmer account to start selling.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* PERSONAL INFORMATION */}

            <div className="section-title">
              <span className="section-number">01</span>

              <div>
                <h3>Personal Information</h3>
                <p>Enter your basic details</p>
              </div>
            </div>

            <div className="input-row">

              <div className="input-group">
                <label htmlFor="name">
                  Full Name <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span>👤</span>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="phone">
                  Mobile Number <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span>📱</span>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter mobile number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

            </div>

            <div className="input-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">
                <span>✉️</span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">
                Password <span>*</span>
              </label>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <small>
                Password should contain at least 6 characters.
              </small>
            </div>

            {/* FARM INFORMATION */}

            <div className="section-title farm-section">
              <span className="section-number">02</span>

              <div>
                <h3>Farm Information</h3>
                <p>Tell us about your farm</p>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="farmName">
                Farm Name
              </label>

              <div className="input-wrapper">
                <span>🌾</span>

                <input
                  id="farmName"
                  name="farmName"
                  type="text"
                  placeholder="e.g. Green Valley Farm"
                  value={form.farmName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="farmLocation">
                Farm Location
              </label>

              <div className="input-wrapper">
                <span>📍</span>

                <input
                  id="farmLocation"
                  name="farmLocation"
                  type="text"
                  placeholder="Village / City"
                  value={form.farmLocation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="farmAddress">
                Farm Address
              </label>

              <div className="textarea-wrapper">
                <span>🏡</span>

                <textarea
                  id="farmAddress"
                  name="farmAddress"
                  placeholder="Enter complete farm address"
                  value={form.farmAddress}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </div>

            {/* TERMS */}

            <label className="terms">
              <input type="checkbox" required />

              <span>
                I agree to the SmartAgri{" "}
                <a href="#">Terms & Conditions</a>{" "}
                and Privacy Policy.
              </span>
            </label>

            {/* SUBMIT */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Farmer Account →"}
            </button>

          </form>

          <p className="login-text">
            Already registered?{" "}
            <a href="/login">
              Login
            </a>
          </p>

        </section>

      </div>

    </main>
  );
}