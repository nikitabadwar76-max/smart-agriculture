"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/customers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        router.push("/login/customer");
      }, 1200);
    } catch (error) {
      console.error(error);
      setMessage("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main className="customer-register-page">
      
      {/* LEFT SIDE */}
      <section className="customer-register-visual">
        <div className="customer-overlay"></div>

        <div className="customer-visual-content">
          <div className="customer-brand">
            🌱 <span>Smart</span>Agri
          </div>

          <div>
            <p className="customer-small-title">
              FRESH • LOCAL • DIRECT
            </p>

            <h1>
              Fresh food,
              <br />
              <span>straight from farms.</span>
            </h1>

            <p className="customer-visual-text">
              Connect directly with local farmers and enjoy
              fresh vegetables and fruits delivered to you.
            </p>

            <div className="customer-points">
              <div>
                <span>✓</span>
                Fresh farm products
              </div>

              <div>
                <span>✓</span>
                Direct from farmers
              </div>

              <div>
                <span>✓</span>
                Trusted & simple shopping
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="customer-register-form-section">

        <div className="customer-register-card">

          <div className="customer-form-header">
            <div className="customer-icon">
              👤
            </div>

            <p className="customer-form-label">
              CUSTOMER ACCOUNT
            </p>

            <h2>Create your account</h2>

            <p>
              Join SmartAgri and start shopping fresh products.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="customer-form-row">

              <div className="customer-input-group">
                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="customer-input-group">
                <label>Mobile Number</label>

                <input
                  type="tel"
                  name="mobile"
                  placeholder="Enter mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="customer-input-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="customer-input-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="customer-input-group">
              <label>Delivery Address</label>

              <textarea
                name="address"
                placeholder="Enter your complete delivery address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            {message && (
              <div
                className={
                  message.toLowerCase().includes("successful")
                    ? "customer-message success"
                    : "customer-message error"
                }
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="customer-register-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Customer Account →"}
            </button>

          </form>

          <div className="customer-login-link">
            Already have an account?
            <button
              type="button"
              onClick={() => router.push("/login/customer")}
            >
              Login
            </button>
          </div>

          <div className="customer-back-home">
            <button
              type="button"
              onClick={() => router.push("/")}
            >
              ← Back to SmartAgri
            </button>
          </div>

        </div>

      </section>

    </main>
  );
}