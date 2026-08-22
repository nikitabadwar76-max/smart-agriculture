"use client";

import Link from "next/link";
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    console.log("Farmer Registration:", form);

    alert(
      "Farmer registration form submitted. Backend will be connected next."
    );

  };


  return (

    <main className="auth-page">

      <div className="form-container">

        <Link href="/register" className="back-link">
          ← Back
        </Link>


        <div className="form-header">

          <div className="auth-logo">
            🌱 FarmDirect
          </div>

          <div className="big-icon">
            👨‍🌾
          </div>

          <h1>Farmer Registration</h1>

          <p>
            Create your farmer account and start selling directly to customers.
          </p>

        </div>


        <form onSubmit={handleSubmit}>

          <h2>Personal Information</h2>


          <label>
            Full Name
          </label>

          <input
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            required
          />


          <label>
            Email Address
          </label>

          <input
            name="email"
            type="email"
            placeholder="farmer@example.com"
            value={form.email}
            onChange={handleChange}
          />


          <label>
            Mobile Number
          </label>

          <input
            name="phone"
            type="tel"
            placeholder="Enter mobile number"
            value={form.phone}
            onChange={handleChange}
            required
          />


          <label>
            Password
          </label>

          <input
            name="password"
            type="password"
            placeholder="Create password"
            value={form.password}
            onChange={handleChange}
            required
          />


          <h2 className="form-section">
            Farm Information
          </h2>


          <label>
            Farm Name
          </label>

          <input
            name="farmName"
            type="text"
            placeholder="e.g. Green Valley Farm"
            value={form.farmName}
            onChange={handleChange}
          />


          <label>
            Farm Location
          </label>

          <input
            name="farmLocation"
            type="text"
            placeholder="Village / City"
            value={form.farmLocation}
            onChange={handleChange}
          />


          <label>
            Farm Address
          </label>

          <textarea
            name="farmAddress"
            placeholder="Enter complete farm address"
            value={form.farmAddress}
            onChange={handleChange}
            rows={4}
          />


          <button type="submit">
            Create Farmer Account →
          </button>

        </form>


        <p className="login-text">
          Already registered?{" "}
          <Link href="/login">
            Login
          </Link>
        </p>

      </div>

    </main>
  );
}