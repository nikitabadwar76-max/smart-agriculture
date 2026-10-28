
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "../../../lib/api";

interface Product {
  product_id: number;
  product_name: string;
  category: string;
  price: number | string;
  unit: string;
  stock: number;
  description?: string;
  image_url?: string | null;
  farmer_name?: string;
  farmer_mobile?: string;
}

interface Feedback {
  feedback_id?: number;
  rating: number;
  comment: string;
  created_at?: string;
  customer_name?: string;
}

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();

  const rawId = params.id;
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load product details from database
  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setProductError("Invalid product ID.");
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setProductError("");

        const response = await fetch(
          `${API_BASE_URL}/api/products/${id}`
        );

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Product not found.");
        }

        const item =
          data.product ??
          data.data?.product ??
          data.data ??
          data;

        if (!item || Number(item.product_id) !== id) {
          throw new Error("Product not found in database.");
        }

        setProduct(item);
      } catch (error) {
        console.error("Product Load Error:", error);
        setProductError(
          error instanceof Error
            ? error.message
            : "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Load feedback for this product
  const loadFeedback = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/product/${id}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error("Feedback Load Error:", error);
    }
  };

  useEffect(() => {
    if (Number.isFinite(id) && id > 0) {
      loadFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Add product to cart
  const addToCart = () => {
    if (!product) return;

    try {
      const existingCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const existingProduct = existingCart.find(
        (item: any) =>
          Number(item.id ?? item.product_id) === product.product_id
      );

      if (existingProduct) {
        existingProduct.quantity =
          Number(existingProduct.quantity || 0) + 1;
      } else {
        existingCart.push({
          ...product,
          id: product.product_id,
          name: product.product_name,
          farmer: product.farmer_name || "Local Farmer",
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(existingCart));
      alert(`${product.product_name} added to cart!`);
    } catch (error) {
      console.error("Cart Error:", error);
      alert("Unable to add product to cart.");
    }
  };

  // Submit customer feedback
  const submitFeedback = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setFeedbackMessage("Please log in to submit feedback.");
      return;
    }

    if (!comment.trim()) {
      setFeedbackMessage("Please write your feedback first.");
      return;
    }

    try {
      setSubmitting(true);
      setFeedbackMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.product_id,
            rating,
            comment: comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to submit feedback."
        );
      }

      setFeedbackMessage("Feedback submitted successfully!");
      setComment("");
      setRating(5);

      await loadFeedback();
    } catch (error) {
      console.error("Submit Feedback Error:", error);
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit feedback."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="product-not-found">
        <h1>Loading product...</h1>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-not-found">
        <h1>Product Not Found</h1>
        <p>{productError || "This product could not be found."}</p>
        <Link href="/marketplace">← Back to Marketplace</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "24px",
        color: "#222",
      }}
    >
      <Link
        href="/marketplace"
        style={{
          display: "inline-block",
          marginBottom: "24px",
          color: "#15803d",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        ← Back to Marketplace
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "32px",
          alignItems: "start",
        }}
      >
        {/* Product image */}
        <div
          style={{
            minHeight: "300px",
            background: "#f0fdf4",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.product_name}
              style={{
                width: "100%",
                height: "320px",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ fontSize: "100px" }}>🌱</span>
          )}
        </div>

        {/* Product details */}
        <section>
          <span
            style={{
              display: "inline-block",
              padding: "6px 12px",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "20px",
              fontSize: "14px",
            }}
          >
            {product.category || "Fresh Farm Product"}
          </span>

          <h1 style={{ fontSize: "32px", margin: "16px 0" }}>
            {product.product_name}
          </h1>

          <p style={{ fontSize: "28px", fontWeight: 700, color: "#15803d" }}>
            ₹{Number(product.price).toLocaleString("en-IN")}
            <span style={{ fontSize: "16px", fontWeight: 400 }}>
              {" "}/ {product.unit || "unit"}
            </span>
          </p>

          <p style={{ marginTop: "16px" }}>
            <strong>Available Stock:</strong>{" "}
            {product.stock} {product.unit || "units"}
          </p>

          <p style={{ marginTop: "12px" }}>
            <strong>Farmer:</strong>{" "}
            {product.farmer_name || "Local Farmer"}
          </p>

          {product.farmer_mobile && (
            <p style={{ marginTop: "8px" }}>
              <strong>Farmer Contact:</strong>{" "}
              {product.farmer_mobile}
            </p>
          )}

          <div style={{ marginTop: "24px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
              About This Product
            </h2>
            <p style={{ lineHeight: 1.7, color: "#555" }}>
              {product.description || "No description available for this product."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "24px",
            }}
          >
            <button
              type="button"
              onClick={addToCart}
              disabled={Number(product.stock) <= 0}
              style={{
                padding: "12px 22px",
                background: Number(product.stock) > 0 ? "#15803d" : "#9ca3af",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: Number(product.stock) > 0 ? "pointer" : "not-allowed",
                fontWeight: 600,
              }}
            >
              {Number(product.stock) > 0 ? "🛒 Add to Cart" : "Out of Stock"}
            </button>

            <button
              type="button"
              onClick={() => {
                addToCart();
                router.push("/cart");
              }}
              disabled={Number(product.stock) <= 0}
              style={{
                padding: "12px 22px",
                background: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: Number(product.stock) > 0 ? "pointer" : "not-allowed",
                fontWeight: 600,
              }}
            >
              Buy Now
            </button>
          </div>
        </section>
      </div>

      {/* Customer Feedback */}
      <section
        style={{
          marginTop: "48px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <h2 style={{ fontSize: "26px", marginBottom: "8px" }}>
          ⭐ Customer Feedback
        </h2>

        <p style={{ color: "#555", marginBottom: "16px" }}>
          Share your experience with this product.
        </p>

        <label style={{ display: "block", fontWeight: 600 }}>
          Rate this product
        </label>

        <div style={{ margin: "8px 0 16px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} stars`}
              style={{
                color: star <= rating ? "#f59e0b" : "#d1d5db",
                fontSize: "32px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 4px",
              }}
            >
              ★
            </button>
          ))}
          <span style={{ marginLeft: "8px" }}>{rating}/5</span>
        </div>

        <label
          htmlFor="feedback-comment"
          style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}
        >
          Your Comment
        </label>

        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Write your feedback about this product..."
          rows={4}
          style={{
            width: "100%",
            maxWidth: "700px",
            display: "block",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "15px",
            resize: "vertical",
          }}
        />

        <button
          type="button"
          onClick={submitFeedback}
          disabled={submitting}
          style={{
            marginTop: "14px",
            padding: "12px 22px",
            background: "#15803d",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: submitting ? "wait" : "pointer",
            fontWeight: 600,
          }}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>

        {feedbackMessage && (
          <p
            role="status"
            style={{
              marginTop: "12px",
              color: feedbackMessage.toLowerCase().includes("success")
                ? "#15803d"
                : "#b91c1c",
            }}
          >
            {feedbackMessage}
          </p>
        )}

        <hr style={{ margin: "28px 0", borderColor: "#e5e7eb" }} />

        <h3 style={{ fontSize: "22px", marginBottom: "16px" }}>
          Customer Reviews ({feedback.length})
        </h3>

        {feedback.length === 0 ? (
          <p style={{ color: "#666" }}>
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div>
            {feedback.map((item, index) => (
              <article
                key={item.feedback_id ?? index}
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "20px",
                    letterSpacing: "2px",
                  }}
                >
                  {"★".repeat(
                    Math.max(0, Math.min(5, Number(item.rating) || 0))
                  )}
                  <span style={{ color: "#d1d5db" }}>
                    {"★".repeat(
                      5 -
                        Math.max(0, Math.min(5, Number(item.rating) || 0))
                    )}
                  </span>
                </div>

                <p style={{ fontWeight: 600, marginTop: "6px" }}>
                  {item.customer_name || "Customer"}
                </p>

                <p style={{ marginTop: "6px", lineHeight: 1.6 }}>
                  {item.comment}
                </p>

                {item.created_at && (
                  <small style={{ color: "#777", display: "block", marginTop: "8px" }}>
                    {new Date(item.created_at).toLocaleDateString("en-IN")}
                  </small>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
