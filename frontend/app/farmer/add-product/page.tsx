"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/api";

export default function AddProduct() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    product_name: "",
    category: "Vegetables",
    description: "",
    price: "",
    unit: "kg",
    stock: "",
    image_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            farmer_id: 1,
            product_name: formData.product_name,
            category: formData.category,
            description: formData.description,
            price: Number(formData.price),
            unit: formData.unit,
            stock: Number(formData.stock),
            image_url: formData.image_url || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to add product"
        );
      }

      setMessage("Product added successfully!");

      setFormData({
        product_name: "",
        category: "Vegetables",
        description: "",
        price: "",
        unit: "kg",
        stock: "",
        image_url: "",
      });

      setTimeout(() => {
        router.push("/farmer/products");
      }, 1500);
    } catch (err: unknown) {
      console.error("Add Product Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="add-product-page">

      {/* SIDEBAR */}
      <aside className="farmer-sidebar">

        <div className="farmer-logo">
          <span className="logo-icon">🌱</span>
          <span>SmartAgri</span>
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
            <span>🏠</span>
            Dashboard
          </Link>

          <Link
            href="/farmer/add-product"
            className="active"
          >
            <span>➕</span>
            Add Product
          </Link>

          <Link href="/farmer/products">
            <span>🌾</span>
            My Products
          </Link>

          <Link href="/farmer/orders">
            <span>📦</span>
            Orders
          </Link>

          <Link href="#">
            <span>👤</span>
            My Profile
          </Link>

        </nav>

        <Link href="/login" className="logout">
          <span>🚪</span>
          Logout
        </Link>

      </aside>

      {/* MAIN CONTENT */}
      <section className="add-product-content">

        {/* HEADER */}
        <div className="add-product-header">

          <div>
            <div className="breadcrumb">
              Farmer Dashboard
              <span>›</span>
              Add Product
            </div>

            <p className="product-page-label">
              PRODUCT MANAGEMENT
            </p>

            <h1>Add New Product</h1>

            <p className="product-page-subtitle">
              List your fresh farm products and connect
              directly with customers.
            </p>
          </div>

          <Link
            href="/farmer/products"
            className="back-products-btn"
          >
            ← My Products
          </Link>

        </div>

        {/* CONTENT GRID */}
        <div className="add-product-grid">

          {/* FORM CARD */}
          <div className="add-product-card">

            <div className="form-card-header">
              <div className="form-card-icon">
                📦
              </div>

              <div>
                <h2>Product Information</h2>
                <p>
                  Enter details about your farm product
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="add-product-form"
            >

              {/* PRODUCT NAME */}
              <div className="form-field full-width">

                <label>
                  Product Name
                  <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🌾</span>

                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    placeholder="Example: Fresh Tomato"
                    required
                  />
                </div>

              </div>

              {/* CATEGORY */}
              <div className="form-field">

                <label>Category</label>

                <div className="input-wrapper">
                  <span className="input-icon">📂</span>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Vegetables">
                      Vegetables
                    </option>

                    <option value="Fruits">
                      Fruits
                    </option>

                    <option value="Grains">
                      Grains
                    </option>

                    <option value="Dairy">
                      Dairy
                    </option>

                    <option value="Pulses">
                      Pulses
                    </option>

                    <option value="Organic">
                      Organic
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

              </div>

              {/* PRICE */}
              <div className="form-field">

                <label>
                  Price
                  <span>*</span>
                </label>

                <div className="input-wrapper price-input">
                  <span className="currency-symbol">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="40"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

              </div>

              {/* STOCK */}
              <div className="form-field">

                <label>
                  Available Stock
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    📊
                  </span>

                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="100"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

              </div>

              {/* UNIT */}
              <div className="form-field">

                <label>Unit</label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ⚖️
                  </span>

                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    <option value="kg">
                      Kilogram (kg)
                    </option>

                    <option value="gram">
                      Gram (g)
                    </option>

                    <option value="quintal">
                      Quintal
                    </option>

                    <option value="piece">
                      Piece
                    </option>

                    <option value="dozen">
                      Dozen
                    </option>

                    <option value="bunch">
                      bunch
                    </option>
                    <option value="litre">
                      litre(L)
                    </option>
                  </select>

                </div>

              </div>

              {/* IMAGE */}
              <div className="form-field full-width">

                <label>Product Image URL</label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🖼️
                  </span>

                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/tomato.jpg"
                  />

                </div>

                <small>
                  Use a clear image URL showing your
                  product.
                </small>

              </div>

              {/* DESCRIPTION */}
              <div className="form-field full-width">

                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your fresh farm product, quality, harvesting details..."
                  rows={5}
                />

                <small>
                  A good description helps customers
                  understand your product.
                </small>

              </div>

              {/* MESSAGE */}
              {message && (
                <div className="product-success">
                  <span>✓</span>
                  <div>
                    <strong>Success!</strong>
                    <p>{message}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="product-error">
                  <span>!</span>
                  <div>
                    <strong>Unable to add product</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div className="form-actions">

                <Link
                  href="/farmer/products"
                  className="cancel-btn"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="save-product-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      🌱 Add Product
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

          {/* PREVIEW */}
          <div className="product-preview-area">

            <div className="preview-card">

              <div className="preview-header">
                <div>
                  <span className="preview-label">
                    LIVE PREVIEW
                  </span>

                  <h2>Your Product</h2>
                </div>

                <span className="preview-eye">
                  👁️
                </span>
              </div>

              <div className="preview-image-container">

                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt={
                      formData.product_name ||
                      "Product preview"
                    }
                  />
                ) : (
                  <div className="preview-placeholder">
                    <div>🌱</div>
                    <p>Product Image</p>
                    <span>
                      Add an image URL to preview
                    </span>
                  </div>
                )}

              </div>

              <div className="preview-details">

                <span className="preview-category">
                  {formData.category}
                </span>

                <h3>
                  {formData.product_name ||
                    "Fresh Farm Product"}
                </h3>

                <p>
                  {formData.description ||
                    "Your product description will appear here."}
                </p>

                <div className="preview-price-row">

                  <div className="preview-price">
                    ₹{formData.price || "0"}
                    <span>
                      / {formData.unit}
                    </span>
                  </div>

                  <div className="preview-stock">
                    <span>Stock</span>
                    <strong>
                      {formData.stock || "0"}{" "}
                      {formData.unit}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

            {/* FARMER TIP */}
            <div className="farmer-tip-card">

              <div className="tip-icon">
                💡
              </div>

              <div>
                <h3>Farmer Tip</h3>

                <p>
                  Use a bright and clear product image,
                  accurate pricing and fresh stock
                  information to attract more customers.
                </p>
              </div>

            </div>

            {/* PRODUCT CHECKLIST */}
            <div className="product-check-card">

              <h3>Before publishing</h3>

              <div className="check-item">
                <span>✓</span>
                Add a clear product name
              </div>

              <div className="check-item">
                <span>✓</span>
                Set the correct price
              </div>

              <div className="check-item">
                <span>✓</span>
                Enter available stock
              </div>

              <div className="check-item">
                <span>✓</span>
                Add a quality image
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}