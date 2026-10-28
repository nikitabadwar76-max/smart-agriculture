"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image_url?: string | null;
  reviewed?: boolean;
  userRating?: number;
  userComment?: string;
}

interface Customer {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

interface Order {
  orderId: string;
  customer: Customer;
  products: Product[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

function OrderDetailsContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("customer");

  // Feedback Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("user_role") || "customer");
    }
  }, []);

  const fetchOrder = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.order) {
        const backendOrder = data.order;
        const customerId = localStorage.getItem("customer_id");

        // Fetch customer reviews to see which products are reviewed
        let reviewedProductsMap: {
          [productId: number]: { rating: number; comment: string };
        } = {};

        if (customerId && token) {
          try {
            const fbRes = await fetch(
              `${API_BASE_URL}/api/feedback/customer/${customerId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const fbData = await fbRes.json();
            if (fbData.success && Array.isArray(fbData.feedback)) {
              fbData.feedback.forEach((f: any) => {
                reviewedProductsMap[f.product_id] = {
                  rating: f.rating,
                  comment: f.comment,
                };
              });
            }
          } catch (e) {
            console.error("Failed to load customer feedback:", e);
          }
        }

        setOrder({
          orderId: String(backendOrder.order_id),
          customer: {
            name: backendOrder.customer_name || "",
            phone: backendOrder.customer_mobile || "",
            address:
              backendOrder.delivery_address ||
              backendOrder.customer_profile_address ||
              "",
            city: "",
            pincode: "",
          },
          products: (data.items || []).map((item: any) => {
            const prevFb = reviewedProductsMap[item.product_id];
            return {
              id: item.product_id,
              name: item.product_name || `Product #${item.product_id}`,
              price: Number(item.price),
              unit: item.unit || "unit",
              quantity: Number(item.quantity),
              image_url: item.image_url,
              reviewed: !!prevFb,
              userRating: prevFb ? prevFb.rating : undefined,
              userComment: prevFb ? prevFb.comment : undefined,
            };
          }),
          subtotal: Number(backendOrder.total_amount),
          deliveryCharge: 0,
          total: Number(backendOrder.total_amount),
          paymentMethod: backendOrder.payment_method || "Cash on Delivery",
          status: backendOrder.order_status || "Pending",
          createdAt: backendOrder.order_date,
        });
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const openFeedbackModal = (product: Product) => {
    setSelectedProduct(product);
    setRating(product.userRating || 5);
    setComment(product.userComment || "");
    setModalMessage(null);
  };

  const closeFeedbackModal = () => {
    setSelectedProduct(null);
    setModalMessage(null);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setModalMessage({
        type: "error",
        text: "Please login to submit feedback.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setModalMessage(null);

      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          order_id: Number(orderId),
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit feedback.");
      }

      setModalMessage({
        type: "success",
        text: "Thank you! Your feedback has been recorded.",
      });

      setTimeout(() => {
        closeFeedbackModal();
        fetchOrder();
      }, 1200);
    } catch (err: any) {
      console.error("Submit feedback error:", err);
      setModalMessage({
        type: "error",
        text: err?.message || "Failed to submit feedback.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="no-order-details">
        <div className="no-orders-icon">🌱</div>
        <h1>Loading Order Details...</h1>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="no-order-details">
        <div className="no-orders-icon">📦</div>
        <h1>Order Not Found</h1>
        <p>The requested order could not be found or you do not have access.</p>
        <Link
          href={userRole === "farmer" ? "/farmer/orders" : "/orders"}
          className="continue-shopping"
        >
          ← Back to Orders
        </Link>
      </main>
    );
  }

  const starLabels: { [key: number]: string } = {
    1: "Poor 😞",
    2: "Fair 😐",
    3: "Good 😊",
    4: "Very Good 😃",
    5: "Excellent! 🌟",
  };

  return (
    <main className="order-details-page">
      {/* Header */}
      <header className="market-header">
        <Link href="/" className="market-logo">
          🌱 SmartAgri
        </Link>

        <nav>
          {userRole === "farmer" ? (
            <>
              <Link href="/farmer/products">My Products</Link>
              <Link href="/farmer/orders" className="market-active">
                Orders
              </Link>
              <Link href="/marketplace">Marketplace</Link>
            </>
          ) : (
            <>
              <Link href="/marketplace">Marketplace</Link>
              <Link href="/cart">Cart</Link>
              <Link href="/orders" className="market-active">
                Orders
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="order-details-container">
        {/* Heading */}
        <div className="order-details-heading">
          <div>
            <p className="hero-small">ORDER DETAILS</p>
            <h1>Order #{order.orderId}</h1>
          </div>

          <span className={`order-status ${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </div>

        <div className="order-details-grid">
          {/* Left Column */}
          <div className="order-details-left">
            {/* Customer Info */}
            <div className="details-card">
              <h2>👤 Customer Information</h2>
              <div className="customer-details">
                {order.customer.name && (
                  <div>
                    <span>Name</span>
                    <strong>{order.customer.name}</strong>
                  </div>
                )}
                {order.customer.phone && (
                  <div>
                    <span>Mobile</span>
                    <strong>{order.customer.phone}</strong>
                  </div>
                )}
                <div>
                  <span>Delivery Address</span>
                  <strong>{order.customer.address}</strong>
                </div>
              </div>
            </div>

            {/* Products with Feedback Support */}
            <div className="details-card">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ margin: 0 }}>🥕 Ordered Products</h2>
                {userRole === "customer" && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    ⭐ Feedback Available
                  </span>
                )}
              </div>

              <div className="details-products">
                {order.products.map((product) => (
                  <div
                    className="details-product"
                    key={product.id}
                    style={{
                      flexWrap: "wrap",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    {/* Image */}
                    <div
                      className="details-product-image"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f0fdf4",
                      }}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span>🌱</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="details-product-info" style={{ flex: 1 }}>
                      <Link
                        href={`/products/${product.id}`}
                        className="hover:text-green-700 transition"
                      >
                        <h3 style={{ margin: "0 0 4px 0", fontWeight: 700 }}>
                          {product.name}
                        </h3>
                      </Link>
                      <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                        ₹{product.price} / {product.unit}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div>
                      <span className="details-quantity">Quantity</span>
                      <strong>
                        {product.quantity} {product.unit}
                      </strong>
                    </div>

                    {/* Total */}
                    <div className="details-product-total">
                      ₹{(product.price * product.quantity).toLocaleString("en-IN")}
                    </div>

                    {/* Customer Feedback Action Button */}
                    {userRole === "customer" && (
                      <div style={{ width: "100%", marginTop: "8px" }}>
                        <button
                          type="button"
                          onClick={() => openFeedbackModal(product)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: "pointer",
                            border: "none",
                            transition: "all 0.2s",
                            background: product.reviewed ? "#ecfdf5" : "#fef3c7",
                            color: product.reviewed ? "#047857" : "#b45309",
                          }}
                        >
                          {product.reviewed ? (
                            <>
                              <span>✓</span> Reviewed (★ {product.userRating}/5)
                              <span style={{ textDecoration: "underline", marginLeft: "4px" }}>
                                Edit
                              </span>
                            </>
                          ) : (
                            <>
                              <span>⭐</span> Rate &amp; Give Feedback
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column / Order Summary */}
          <aside className="details-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{order.subtotal.toLocaleString("en-IN")}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <strong>₹{order.deliveryCharge}</strong>
            </div>

            <div className="summary-line" />

            <div className="summary-total">
              <span>Total</span>
              <strong>₹{order.total.toLocaleString("en-IN")}</strong>
            </div>

            <div className="payment-box">
              <span>PAYMENT</span>
              <strong>
                {order.paymentMethod.toLowerCase().includes("cash") ||
                order.paymentMethod.toLowerCase() === "cod"
                  ? "💵 Cash on Delivery"
                  : "💳 Online Payment"}
              </strong>
            </div>

            <div className="order-date">
              Order placed:
              <strong>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-IN")
                  : "-"}
              </strong>
            </div>

            <Link
              href={userRole === "farmer" ? "/farmer/orders" : "/orders"}
              className="back-orders-button"
            >
              ← Back to Orders
            </Link>
          </aside>
        </div>
      </section>

      {/* FEEDBACK POPUP MODAL */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={closeFeedbackModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              maxWidth: "500px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: "#166534",
                    letterSpacing: "1px",
                  }}
                >
                  Verified Purchase Review
                </span>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    margin: "4px 0 0",
                    color: "#1f2937",
                  }}
                >
                  {selectedProduct.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeFeedbackModal}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              {/* Star Rating */}
              <div style={{ margin: "20px 0" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#4b5563",
                    marginBottom: "8px",
                  }}
                >
                  Rating:{" "}
                  <strong style={{ color: "#d97706" }}>
                    {starLabels[hoverRating || rating]}
                  </strong>
                </label>

                <div style={{ display: "flex", gap: "6px" }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "36px",
                          color: active ? "#f59e0b" : "#e5e7eb",
                          cursor: "pointer",
                          padding: "0 4px",
                          transition: "transform 0.15s",
                        }}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment Input */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#4b5563",
                    marginBottom: "8px",
                  }}
                >
                  Your Review &amp; Experience
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other customers about the taste, quality, freshness, or delivery..."
                  rows={4}
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: "14px",
                    padding: "12px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "none",
                  }}
                />
              </div>

              {modalMessage && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    background:
                      modalMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                    color:
                      modalMessage.type === "success" ? "#065f46" : "#991b1b",
                    border: `1px solid ${
                      modalMessage.type === "success" ? "#a7f3d0" : "#fecaca"
                    }`,
                  }}
                >
                  {modalMessage.text}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={closeFeedbackModal}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#16a34a",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: submitting ? "wait" : "pointer",
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : selectedProduct.reviewed
                    ? "Update Feedback"
                    : "Submit Feedback ⭐"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<main className="no-order-details" />}>
      <OrderDetailsContent />
    </Suspense>
  );
}