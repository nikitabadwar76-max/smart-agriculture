"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const API_URL = "http://localhost:5000/api/customers/register";

export default function CustomerRegisterPage() {
  const [form, setForm] = useState({
    customer_name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
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

  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.customer_name ||
      !form.mobile ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
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
        throw new Error(
          data.message || "Registration failed."
        );
      }

      setMessage(
        "✅ Account created successfully! You can now login."
      );

      setForm({
        customer_name: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Registration Error:", error);

      setError(
        error?.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="customer-register-page">
      <div className="customer-register-card">
        <Link
          href="/login"
          className="back-login"
        >
          ← Back to Login
        </Link>

        <div className="customer-logo">
          🌱
        </div>

        <div className="customer-header">
          <span>SMARTAGRI</span>

          <h1>Create Account</h1>

          <p>
            Join SmartAgri and shop fresh products
            directly from local farmers.
          </p>
        </div>

        {error && (
          <div className="customer-error">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className="customer-success">
            {message}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="customer-field">
            <label htmlFor="customer_name">
              Full Name *
            </label>

            <input
              id="customer_name"
              name="customer_name"
              type="text"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="customer-field">
            <label htmlFor="mobile">
              Mobile Number *
            </label>

            <input
              id="mobile"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              required
            />
          </div>

          <div className="customer-field">
            <label htmlFor="password">
              Password *
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create password"
              minLength={6}
              required
            />
          </div>

          <div className="customer-field">
            <label htmlFor="confirmPassword">
              Confirm Password *
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="customer-register-button"
          >
            {loading
              ? "Creating Account..."
              : "Create Account →"}
          </button>
        </form>

        <div className="customer-login">
          Already have an account?{" "}
          <Link href="/login">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
