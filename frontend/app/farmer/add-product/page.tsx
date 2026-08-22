"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  // ==========================================
  // HANDLE INPUT
  // ==========================================

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

  // ==========================================
  // SUBMIT PRODUCT
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/products",
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

      setMessage("✅ Product added successfully!");

      // Clear form

      setFormData({
        product_name: "",
        category: "Vegetables",
        description: "",
        price: "",
        unit: "kg",
        stock: "",
        image_url: "",
      });

      // Redirect after 1.5 seconds

      setTimeout(() => {
        router.push("/farmer/products");
      }, 1500);

    } catch (err: any) {
      console.error("❌ Add Product Error:", err);

      setError(
        err.message || "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="farmer-dashboard">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="farmer-sidebar">

        <div className="farmer-logo">
          🌱 FarmDirect
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

          <Link href="/farmer/orders">
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


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <section className="dashboard-content">

        <div className="dashboard-top">

          <div>

            <p className="dashboard-label">
              PRODUCT MANAGEMENT
            </p>

            <h1>
              Add New Product
            </h1>

            <p>
              Add your fresh farm product to FarmDirect.
            </p>

          </div>

          <Link
            href="/farmer/products"
            className="add-product-btn"
          >
            ← My Products
          </Link>

        </div>


        {/* ==========================================
            FORM CARD
        ========================================== */}

        <div className="products-table-card">

          <form
            onSubmit={handleSubmit}
            style={{
              padding: "30px",
              maxWidth: "800px",
            }}
          >

            {/* PRODUCT NAME */}

            <div style={{ marginBottom: "20px" }}>

              <label>
                Product Name
              </label>

              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="Example: Fresh Tomato"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />

            </div>


            {/* CATEGORY */}

            <div style={{ marginBottom: "20px" }}>

              <label>
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
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

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            {/* DESCRIPTION */}

            <div style={{ marginBottom: "20px" }}>

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your fresh farm product..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  resize: "vertical",
                }}
              />

            </div>


            {/* PRICE + UNIT */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >

              <div>

                <label>
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="40"
                  min="0"
                  step="0.01"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                />

              </div>


              <div>

                <label>
                  Unit
                </label>

                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                >

                  <option value="kg">
                    Kilogram (kg)
                  </option>

                  <option value="gram">
                    Gram
                  </option>

                  <option value="piece">
                    Piece
                  </option>

                  <option value="dozen">
                    Dozen
                  </option>

                  <option value="liter">
                    Liter
                  </option>

                </select>

              </div>

            </div>


            {/* STOCK */}

            <div style={{ marginBottom: "20px" }}>

              <label>
                Available Stock
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="100"
                min="0"
                step="0.01"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />

            </div>


            {/* IMAGE */}

            <div style={{ marginBottom: "20px" }}>

              <label>
                Product Image URL
              </label>

              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/tomato.jpg"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />

            </div>


            {/* SUCCESS */}

            {message && (

              <div
                style={{
                  padding: "12px",
                  marginBottom: "20px",
                  background: "#ecfdf5",
                  color: "#047857",
                  borderRadius: "8px",
                }}
              >
                {message}
              </div>

            )}


            {/* ERROR */}

            {error && (

              <div
                style={{
                  padding: "12px",
                  marginBottom: "20px",
                  background: "#fef2f2",
                  color: "#dc2626",
                  borderRadius: "8px",
                }}
              >
                ❌ {error}
              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="add-product-btn"
              style={{
                border: "none",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >

              {loading
                ? "Adding Product..."
                : "🌱 Add Product"}

            </button>

          </form>

        </div>

      </section>

    </main>
  );
}