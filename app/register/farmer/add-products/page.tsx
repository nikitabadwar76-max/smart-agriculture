"use client";

import Link from "next/link";
import { useState } from "react";

export default function AddProduct() {

  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    unit: "kg",
    description: "",
  });


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {

    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    console.log("Product:", product);

    alert(
      "Product added successfully! Backend will be connected later."
    );

  };


  return (

    <main className="farmer-dashboard">

      {/* Sidebar */}

      <aside className="farmer-sidebar">

        <div className="farmer-logo">
          🌱 SmartAgri
        </div>

        <div className="farmer-profile">

          <div className="farmer-avatar">
            👨‍🌾
          </div>

          <h3>Farmer</h3>

          <p>Farm Owner</p>

        </div>


        <nav className="farmer-nav">

          <Link href="/farmer/dashboard">
            🏠 Dashboard
          </Link>

          <Link
            href="/farmer/add-product"
            className="active"
          >
            ➕ Add Product
          </Link>

          <Link href="/farmer/products">
            🌾 My Products
          </Link>

          <Link href="#">
            📦 Orders
          </Link>

          <Link href="#">
            👤 My Profile
          </Link>

        </nav>


        <Link href="/login" className="logout">
          🚪 Logout
        </Link>

      </aside>


      {/* Main */}

      <section className="dashboard-content">

        <Link
          href="/farmer/dashboard"
          className="back-link"
        >
          ← Back to Dashboard
        </Link>


        <div className="page-heading">

          <div>

            <p className="dashboard-label">
              PRODUCT MANAGEMENT
            </p>

            <h1>Add New Product</h1>

            <p>
              Add your agricultural product to the marketplace.
            </p>

          </div>

        </div>


        <div className="product-form-card">

          <form onSubmit={handleSubmit}>

            <h2>Product Information</h2>


            <div className="form-grid">

              {/* Product Name */}

              <div className="form-group">

                <label>
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Fresh Tomato"
                  value={product.name}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* Category */}

              <div className="form-group">

                <label>
                  Category *
                </label>

                <select
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Category
                  </option>

                  <option value="Vegetables">
                    Vegetables
                  </option>

                  <option value="Fruits">
                    Fruits
                  </option>

                  <option value="Grains">
                    Grains
                  </option>

                  <option value="Pulses">
                    Pulses
                  </option>

                  <option value="Dairy">
                    Dairy
                  </option>

                  <option value="Spices">
                    Spices
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* Price */}

              <div className="form-group">

                <label>
                  Price *
                </label>

                <div className="input-with-symbol">

                  <span>₹</span>

                  <input
                    type="number"
                    name="price"
                    placeholder="0"
                    min="0"
                    value={product.price}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* Quantity */}

              <div className="form-group">

                <label>
                  Available Quantity *
                </label>

                <input
                  type="number"
                  name="quantity"
                  placeholder="e.g. 100"
                  min="0"
                  value={product.quantity}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* Unit */}

              <div className="form-group">

                <label>
                  Unit
                </label>

                <select
                  name="unit"
                  value={product.unit}
                  onChange={handleChange}
                >

                  <option value="kg">
                    Kilogram (kg)
                  </option>

                  <option value="quintal">
                    Quintal
                  </option>

                  <option value="ton">
                    Ton
                  </option>

                  <option value="dozen">
                    Dozen
                  </option>

                  <option value="piece">
                    Piece
                  </option>

                </select>

              </div>

            </div>


            {/* Description */}

            <div className="form-group">

              <label>
                Product Description
              </label>

              <textarea
                name="description"
                rows={5}
                placeholder="Describe your product, farming method, freshness, etc."
                value={product.description}
                onChange={handleChange}
              />

            </div>


            {/* Image */}

            <div className="form-group">

              <label>
                Product Image
              </label>

              <div className="image-upload">

                <div className="upload-icon">
                  📷
                </div>

                <h3>
                  Upload Product Image
                </h3>

                <p>
                  JPG, PNG or WEBP
                </p>

                <input
                  type="file"
                  accept="image/*"
                />

              </div>

            </div>


            {/* Buttons */}

            <div className="form-actions">

              <Link
                href="/farmer/dashboard"
                className="cancel-btn"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="save-product-btn"
              >
                Add Product →
              </button>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}