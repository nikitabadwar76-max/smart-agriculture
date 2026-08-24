"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import "./register.css";

const API_URL = "http://localhost:5000/api/farmers/register";

export default function FarmerRegisterPage() {
  const [form, setForm] = useState({
    farmer_name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    farm_name: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.farmer_name ||
      !form.mobile ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmer_name: form.farmer_name,
          mobile: form.mobile,
          email: form.email,
          password: form.password,
          farm_name: form.farm_name,
          location: form.location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      setMessage(
        "Registration successful! You can now login to your farmer account."
      );

      setForm({
        farmer_name: "",
        mobile: "",
        email: "",
        password: "",
        confirmPassword: "",
        farm_name: "",
        location: "",
      });
    } catch (err: any) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-background">
        <div className="leaf leaf-one">🌿</div>
        <div className="leaf leaf-two">🍃</div>
        <div className="leaf leaf-three">🌱</div>
      </div>

      <section className="register-card">
        <div className="register-left">
          <div className="brand">
            <div className="brand-icon">🌱</div>
            <span>SmartAgri</span>
          </div>

          <div className="welcome-content">
            <span className="small-badge">FARMER PORTAL</span>

            <h1>
              Grow your business.
              <br />
              <span>Grow with SmartAgri.</span>
            </h1>

            <p>
              Join SmartAgri and connect directly with customers,
              manage your products, and grow your agricultural
              business online.
            </p>

            <div className="benefits">
              <div className="benefit">
                <div className="benefit-icon">✓</div>
                <div>
                  <strong>Sell directly</strong>
                  <span>Reach customers without unnecessary middlemen.</span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">✓</div>
                <div>
                  <strong>Manage products</strong>
                  <span>Add, update and manage your farm products.</span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">✓</div>
                <div>
                  <strong>Track orders</strong>
                  <span>Manage customer orders from one dashboard.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="left-footer">
            <span>🌾 Fresh. Local. Direct.</span>
          </div>
        </div>

        <div className="register-right">
          <div className="form-header">
            <span className="mobile-brand">🌱 SmartAgri</span>
            <h2>Create your farmer account</h2>
            <p>
              Fill in your details to start selling on SmartAgri.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              <span>✓</span>
              <p>{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="section-title">
              <span>01</span>
              <div>
                <strong>Personal information</strong>
                <small>Tell us about yourself</small>
              </div>
            </div>

            <div className="form-grid">
              <div className="input-group full">
                <label htmlFor="farmer_name">
                  Full name <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="farmer_name"
                    name="farmer_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.farmer_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="mobile">
                  Mobile number <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={form.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="email">Email address</label>

                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="section-title section-space">
              <span>02</span>
              <div>
                <strong>Farm information</strong>
                <small>Help customers know your farm</small>
              </div>
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="farm_name">Farm name</label>

                <div className="input-wrapper">
                  <span className="input-icon">🌾</span>
                  <input
                    id="farm_name"
                    name="farm_name"
                    type="text"
                    placeholder="e.g. Green Valley Farm"
                    value={form.farm_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="location">Farm location</label>

                <div className="input-wrapper">
                  <span className="input-icon">📍</span>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="City / Village"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="section-title section-space">
              <span>03</span>
              <div>
                <strong>Account security</strong>
                <small>Create a secure password</small>
              </div>
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="password">
                  Password <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create password"
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">
                  Confirm password <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🔐</span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    minLength={6}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Farmer Account
                  <span>→</span>
                </>
              )}
            </button>

            <p className="terms">
              By creating an account, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <div className="login-divider">
            <span>Already have an account?</span>
          </div>

          <Link href="/login" className="login-button">
            Sign in to your account
          </Link>
        </div>
      </section>
    </main>
  );
}