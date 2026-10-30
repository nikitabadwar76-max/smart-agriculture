"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/api";
import { detectUnitFromProductName } from "../../../lib/unitDetector";

export default function AddProduct() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    product_name: "",
    category: "Vegetables",
    description: "",
    price: "",
    discount_percent: "0",
    unit: "kg",
    stock: "",
    image_url: "",
  });

  const [autoUnitNotice, setAutoUnitNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const popularQuickProducts = [
    { name: "Banana (केळी)", category: "Fruits", unit: "dozen", img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e" },
    { name: "Fresh Tomato", category: "Vegetables", unit: "kg", img: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337" },
    { name: "Fresh Palak (पालक)", category: "Vegetables", unit: "bunch", img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb" },
    { name: "Organic Milk (दूध)", category: "Dairy", unit: "litre", img: "https://images.unsplash.com/photo-1550583724-b2692b85b150" },
    { name: "Farm Fresh Eggs (अंडी)", category: "Dairy", unit: "dozen", img: "https://images.unsplash.com/photo-1516467508483-a7212febe31a" },
    { name: "Fresh Coconut (नारळ)", category: "Fruits", unit: "piece", img: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b" },
  ];

  const handleProductNameChange = (value: string) => {
    const detected = detectUnitFromProductName(value);
    setFormData((prev) => ({
      ...prev,
      product_name: value,
      unit: detected ? detected.unit : prev.unit,
    }));

    if (detected) {
      setAutoUnitNotice(`⚡ Auto-selected: ${detected.label} (${detected.reason})`);
    } else {
      setAutoUnitNotice(null);
    }
  };

  const handleQuickSelect = (item: typeof popularQuickProducts[0]) => {
    setFormData((prev) => ({
      ...prev,
      product_name: item.name,
      category: item.category,
      unit: item.unit,
      image_url: item.img,
    }));
    setAutoUnitNotice(`⚡ Auto-selected: ${item.unit.toUpperCase()} for ${item.name}`);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "product_name") {
      handleProductNameChange(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Calculations for Discount
  const rawPrice = Number(formData.price) || 0;
  const discountPct = Math.min(Math.max(Number(formData.discount_percent) || 0, 0), 90);
  const discountedPrice = discountPct > 0 ? (rawPrice * (1 - discountPct / 100)) : rawPrice;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in as a farmer first.");
      }

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_name: formData.product_name.trim(),
          category: formData.category,
          description: formData.description.trim(),
          price: rawPrice,
          discount_percent: discountPct,
          unit: formData.unit,
          stock: Number(formData.stock),
          image_url: formData.image_url.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add product.");
      }

      setMessage("Product added successfully!");

      setFormData({
        product_name: "",
        category: "Vegetables",
        description: "",
        price: "",
        discount_percent: "0",
        unit: "kg",
        stock: "",
        image_url: "",
      });
      setAutoUnitNotice(null);

      setTimeout(() => {
        router.push("/farmer/products");
      }, 1500);
    } catch (err: unknown) {
      console.error("Add Product Error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
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
          <div className="farmer-avatar">👨‍🌾</div>
          <h3>Farmer</h3>
          <p>Farm Owner</p>
        </div>

        <nav className="farmer-nav">
          <Link href="/farmer/dashboard">
            <span>🏠</span>
            Dashboard
          </Link>

          <Link href="/farmer/add-product" className="active">
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

            <p className="product-page-label">PRODUCT MANAGEMENT</p>
            <h1>Add New Product</h1>
            <p className="product-page-subtitle">
              List fresh farm products. Units (kg, dozen, litre, etc.) auto-detect instantly and set custom discounts anytime.
            </p>
          </div>

          <Link href="/farmer/products" className="back-products-btn">
            ← My Products
          </Link>
        </div>

        {/* CONTENT GRID */}
        <div className="add-product-grid">
          {/* FORM CARD */}
          <div className="add-product-card">
            <div className="form-card-header">
              <div className="form-card-icon">📦</div>
              <div>
                <h2>Product Information</h2>
                <p>Type name and unit will be chosen automatically!</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Quick Presets (झटपट निवड):
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {popularQuickProducts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickSelect(p)}
                    style={{
                      background: formData.product_name === p.name ? "#ecfdf5" : "#f3f4f6",
                      border: formData.product_name === p.name ? "1px solid #10b981" : "1px solid #e5e7eb",
                      color: formData.product_name === p.name ? "#047857" : "#374151",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{p.name}</span>
                    <span style={{ opacity: 0.65, fontSize: "11px" }}>({p.unit})</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="add-product-form">
              {/* PRODUCT NAME */}
              <div className="form-field full-width">
                <label>
                  Product Name <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🌾</span>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    placeholder="उदा. Banana / केळी, Tomato, Milk, Eggs..."
                    required
                  />
                </div>

                {autoUnitNotice && (
                  <div
                    style={{
                      marginTop: "6px",
                      padding: "6px 12px",
                      background: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      borderRadius: "8px",
                      color: "#065f46",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    <span>{autoUnitNotice}</span>
                  </div>
                )}
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
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Organic">Organic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* UNIT (AUTO DETECTED) */}
              <div className="form-field">
                <label>
                  Unit (एकक) <span>* Auto-Selected</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">⚖️</span>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    style={{
                      background: "#f0fdf4",
                      fontWeight: 700,
                      color: "#166534",
                      borderColor: "#86efac",
                    }}
                  >
                    <option value="kg">Kilogram (kg) - किलो</option>
                    <option value="dozen">Dozen (डझन - केळी, अंडी इ.)</option>
                    <option value="litre">Litre (L) - लिटर (दूध, तेल)</option>
                    <option value="bunch">Bunch (जुडी - पालक, मेथी)</option>
                    <option value="piece">Piece (नग - नारळ, कलिंगड)</option>
                    <option value="quintal">Quintal (क्विंटल)</option>
                    <option value="gram">Gram (g)</option>
                  </select>
                </div>
              </div>

              {/* PRICE */}
              <div className="form-field">
                <label>
                  Original Price / मूळ किंमत (per {formData.unit}) <span>*</span>
                </label>
                <div className="input-wrapper price-input">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="40"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* STOCK */}
              <div className="form-field">
                <label>
                  Available Stock ({formData.unit}) <span>*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">📊</span>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="उदा. 100"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* DISCOUNT (NEW FEATURE) */}
              <div className="form-field full-width" style={{ background: "#fffbeb", padding: "16px", borderRadius: "16px", border: "1px solid #fde68a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ margin: 0, fontWeight: 700, color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🏷️</span> Product Discount (सवलत / ऑफर)
                  </label>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#b45309" }}>
                    {discountPct}% OFF
                  </span>
                </div>

                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#78350f", lineHeight: 1.4 }}>
                  💡 उदा. तुमच्याकडे 100 स्टॉक उपलब्ध आहे आणि 50 विकले, तर उरलेल्या 50 साठी ग्राहकांना आकर्षित करण्यासाठी सवलत द्या!
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <input
                    type="range"
                    name="discount_percent"
                    min="0"
                    max="80"
                    step="5"
                    value={formData.discount_percent}
                    onChange={handleChange}
                    style={{ flex: 1, accentColor: "#d97706", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #fcd34d", borderRadius: "10px", padding: "4px 8px" }}>
                    <input
                      type="number"
                      name="discount_percent"
                      min="0"
                      max="90"
                      value={formData.discount_percent}
                      onChange={handleChange}
                      style={{ width: "45px", border: "none", outline: "none", fontWeight: 700, textAlign: "right" }}
                    />
                    <span style={{ fontWeight: 700, color: "#6b7280", marginLeft: "4px" }}>%</span>
                  </div>
                </div>

                {/* Quick discount buttons */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[0, 10, 15, 20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, discount_percent: String(pct) }))}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: discountPct === pct ? "2px solid #b45309" : "1px solid #fde68a",
                        background: discountPct === pct ? "#fef3c7" : "#fff",
                        color: discountPct === pct ? "#92400e" : "#4b5563",
                      }}
                    >
                      {pct === 0 ? "No Discount (0%)" : `${pct}% OFF`}
                    </button>
                  ))}
                </div>

                {rawPrice > 0 && discountPct > 0 && (
                  <div style={{ marginTop: "12px", padding: "8px 12px", background: "#fff", borderRadius: "10px", border: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>
                      Original: <del>₹{rawPrice.toFixed(2)}</del>
                    </span>
                    <strong style={{ fontSize: "15px", color: "#15803d" }}>
                      Discounted Price: ₹{discountedPrice.toFixed(2)} / {formData.unit}
                    </strong>
                  </div>
                )}
              </div>

              {/* IMAGE */}
              <div className="form-field full-width">
                <label>Product Image URL</label>
                <div className="input-wrapper">
                  <span className="input-icon">🖼️</span>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
                <small>Use a clear image URL showing your product.</small>
              </div>

              {/* DESCRIPTION */}
              <div className="form-field full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="ताजा शेतमाल, आजची काढणी, उत्कृष्ट दर्जा..."
                  rows={4}
                />
              </div>

              {/* SUCCESS MESSAGE */}
              {message && (
                <div className="product-success">
                  <span>✓</span>
                  <div>
                    <strong>Success!</strong>
                    <p>{message}</p>
                  </div>
                </div>
              )}

              {/* ERROR MESSAGE */}
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
                <Link href="/farmer/products" className="cancel-btn">
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
                    <>🌱 Add Product</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* LIVE PREVIEW */}
          <div className="product-preview-area">
            <div className="preview-card">
              <div className="preview-header">
                <div>
                  <span className="preview-label">LIVE PREVIEW</span>
                  <h2>Your Product</h2>
                </div>
                <span className="preview-eye">👁️</span>
              </div>

              <div className="preview-image-container" style={{ position: "relative" }}>
                {discountPct > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(220, 38, 38, 0.35)",
                      zIndex: 10,
                    }}
                  >
                    🔥 {discountPct}% OFF
                  </span>
                )}

                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt={formData.product_name || "Product preview"}
                  />
                ) : (
                  <div className="preview-placeholder">
                    <div>🌱</div>
                    <p>Product Image</p>
                    <span>Add an image URL to preview</span>
                  </div>
                )}
              </div>

              <div className="preview-details">
                <span className="preview-category">{formData.category}</span>

                <h3>{formData.product_name || "Fresh Farm Product"}</h3>

                <p>
                  {formData.description || "Your product description will appear here."}
                </p>

                <div className="preview-price-row">
                  <div className="preview-price">
                    {discountPct > 0 ? (
                      <>
                        <span style={{ fontSize: "14px", textDecoration: "line-through", color: "#9ca3af", marginRight: "6px" }}>
                          ₹{rawPrice.toFixed(0)}
                        </span>
                        <span>₹{discountedPrice.toFixed(0)}</span>
                        <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "4px" }}>
                          / {formData.unit}
                        </span>
                      </>
                    ) : (
                      <>
                        ₹{rawPrice || "0"}
                        <span>/ {formData.unit}</span>
                      </>
                    )}
                  </div>

                  <div className="preview-stock">
                    <span>Stock</span>
                    <strong>
                      {formData.stock || "0"} {formData.unit}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* FARMER TIP */}
            <div className="farmer-tip-card">
              <div className="tip-icon">💡</div>
              <div>
                <h3>Auto-Unit &amp; Discount</h3>
                <p>
                  केळी / Eggs automatically select <strong>dozen</strong>, भाज्या select <strong>kg</strong>, दूध selects <strong>litre</strong>. Set stock clearance discounts anytime!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}