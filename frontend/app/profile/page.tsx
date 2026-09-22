"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("user_role") || "";

    setRole(userRole);

    if (userRole === "customer") {
      setName(localStorage.getItem("customer_name") || "");
      setMobile(localStorage.getItem("customer_mobile") || "");
    }

    if (userRole === "farmer") {
      setName(localStorage.getItem("farmer_name") || "");
      setMobile(localStorage.getItem("farmer_mobile") || "");
      setEmail(localStorage.getItem("farmer_email") || "");
      setLocation(localStorage.getItem("farmer_location") || "");
      setAddress(localStorage.getItem("farmer_address") || "");
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="orders-page">
      <header className="market-header">
        <Link href="/marketplace" className="market-logo">
          🌱 SmartAgri
        </Link>

        <nav>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/profile" className="active">
            Profile
          </Link>
        </nav>
      </header>

      <main className="orders-container">
        <div className="orders-header">
          <div>
            <p className="orders-label">My Account</p>
            <h1>My Profile</h1>
            <p>View your account information.</p>
          </div>
        </div>

        <div className="orders-list">

          <article className="order-card">
            <div className="order-top">
              <div>
                <h2 className="order-number">
                  {name || "User"}
                </h2>

                <p className="order-date">
                  {role === "customer" ? "Customer Account" : "Farmer Account"}
                </p>
              </div>

              <span className="order-status accepted">
                {role}
              </span>
            </div>

            <div className="order-info">

              <div className="order-info-item">
                <span>Name</span>
                <strong>{name || "-"}</strong>
              </div>

              <div className="order-info-item">
                <span>Mobile</span>
                <strong>{mobile || "-"}</strong>
              </div>

              {role === "farmer" && (
                <>
                  <div className="order-info-item">
                    <span>Email</span>
                    <strong>{email || "-"}</strong>
                  </div>

                  <div className="order-info-item">
                    <span>Location</span>
                    <strong>{location || "-"}</strong>
                  </div>

                  <div className="order-info-item">
                    <span>Address</span>
                    <strong>{address || "-"}</strong>
                  </div>
                </>
              )}

            </div>

            <div className="order-total">
              <span>Account Type</span>
              <strong>
                {role === "customer" ? "Customer" : "Farmer"}
              </strong>
            </div>

            <button
              onClick={logout}
              className="view-order-btn"
            >
              Logout
            </button>

          </article>

        </div>
      </main>
    </div>
  );
}