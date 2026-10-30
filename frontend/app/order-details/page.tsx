"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";
import "./order-details.css";

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
  distanceKm: number;
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
  const [copiedId, setCopiedId] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

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

      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

        const delivery = Number(backendOrder.delivery_charge) || 0;
        const total = Number(backendOrder.total_amount) || 0;
        const items = data.items || [];
        const itemsSubtotal = items.reduce(
          (sum: number, it: any) =>
            sum + (Number(it.subtotal) || Number(it.price) * Number(it.quantity)),
          0
        );

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
          products: items.map((item: any) => {
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
          subtotal: itemsSubtotal > 0 ? itemsSubtotal : total - delivery,
          deliveryCharge: delivery,
          distanceKm: Number(backendOrder.distance_km) || 0,
          total: total,
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

  const copyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(`FD${order.orderId.padStart(8, "0")}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleWhatsAppShare = () => {
    if (!order) return;
    const phone =
      order.customer.phone.replace(/\D/g, "") ||
      localStorage.getItem("customer_mobile") ||
      "";
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;

    const itemsText = order.products
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} - ${p.quantity} ${p.unit} (₹${(
            p.price * p.quantity
          ).toFixed(0)})`
      )
      .join("\n");

    const message = `🌱 *SmartAgri Order Details*\n*Order ID:* #FD${order.orderId.padStart(
      8,
      "0"
    )}\n*Status:* ${order.status}\n\n*Items:*\n${itemsText}\n\n*Delivery Fee:* ₹${
      order.deliveryCharge
    }\n*Total:* ₹${order.total.toFixed(0)}\n*Payment:* ${
      order.paymentMethod
    }\n\n📍 *Address:* ${order.customer.address}`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

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
      <main className="order-details-page">
        <header className="od-header">
          <div className="od-header-container">
            <Link href="/" className="od-brand">
              <span>🌱</span>
              <span>SmartAgri</span>
            </Link>
          </div>
        </header>
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "50px", marginBottom: "16px" }}>🌱</div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#065f46" }}>
            Loading Order Details...
          </h1>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            Retrieving fresh farm receipt and order status.
          </p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="order-details-page">
        <header className="od-header">
          <div className="od-header-container">
            <Link href="/" className="od-brand">
              <span>🌱</span>
              <span>SmartAgri</span>
            </Link>
          </div>
        </header>
        <div style={{ textAlign: "center", padding: "100px 20px", maxWidth: "450px", margin: "0 auto" }}>
          <div style={{ fontSize: "60px", marginBottom: "16px" }}>📦</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1f2937" }}>
            Order Not Found
          </h1>
          <p style={{ color: "#6b7280", marginTop: "8px", lineHeight: 1.5 }}>
            The requested order ID could not be loaded or you do not have permission to view it.
          </p>
          <Link
            href={userRole === "farmer" ? "/farmer/orders" : "/orders"}
            className="od-back-btn"
            style={{ marginTop: "24px", background: "#059669", color: "#fff" }}
          >
            ← View All Orders
          </Link>
        </div>
      </main>
    );
  }

  const statusLower = order.status.toLowerCase();
  const isConfirmed =
    statusLower === "confirmed" ||
    statusLower === "processing" ||
    statusLower === "shipped" ||
    statusLower === "delivered";
  const isShipped =
    statusLower === "processing" ||
    statusLower === "shipped" ||
    statusLower === "delivered";
  const isDelivered = statusLower === "delivered";

  const isUpi =
    order.paymentMethod.toLowerCase().includes("upi") ||
    order.paymentMethod.toLowerCase().includes("phonepe");

  const formattedOrderId = `FD${order.orderId.padStart(8, "0")}`;

  return (
    <main className="order-details-page">
      {/* HEADER */}
      <header className="od-header">
        <div className="od-header-container">
          <Link href="/" className="od-brand">
            <span>🌱</span>
            <span>SmartAgri</span>
          </Link>

          <nav className="od-nav-links">
            {userRole === "farmer" ? (
              <>
                <Link href="/farmer/products" className="od-nav-link">
                  My Products
                </Link>
                <Link href="/farmer/orders" className="od-nav-link active">
                  Orders
                </Link>
                <Link href="/marketplace" className="od-nav-link">
                  Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link href="/marketplace" className="od-nav-link">
                  Marketplace
                </Link>
                <Link href="/cart" className="od-nav-link">
                  Cart
                </Link>
                <Link href="/orders" className="od-nav-link active">
                  My Orders
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="od-main-container">
        {/* =========================================================
            TOP HERO STATUS CARD
        ========================================================= */}
        <div className="od-hero-card">
          <div className="od-hero-header">
            <div>
              <p className="od-hero-tag">ORDER RECEIPT &amp; DETAILS</p>
              <h1 className="od-hero-title">
                Order #{formattedOrderId}
                <button
                  type="button"
                  onClick={copyOrderId}
                  className={`od-copy-btn ${copiedId ? "copied" : ""}`}
                >
                  {copiedId ? "✓ Copied!" : "📋 Copy ID"}
                </button>
              </h1>
            </div>

            <div className={`od-status-pill ${statusLower}`}>
              <span className="od-status-dot" />
              <span>{order.status}</span>
            </div>
          </div>

          {/* INTERACTIVE TRACKING STEPPER */}
          <div className="od-stepper">
            <div className="od-step completed">
              <div className="od-step-icon">📦</div>
              <div className="od-step-info">
                <span className="od-step-title">Order Placed</span>
                <span className="od-step-sub">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "Done"}
                </span>
              </div>
            </div>

            <div className={`od-step ${isConfirmed ? "completed" : "upcoming"}`}>
              <div className="od-step-icon">
                {isConfirmed ? "✓" : "2"}
              </div>
              <div className="od-step-info">
                <span className="od-step-title">Confirmed</span>
                <span className="od-step-sub">Farmer Verified</span>
              </div>
            </div>

            <div
              className={`od-step ${
                isShipped
                  ? "completed"
                  : isConfirmed
                  ? "current"
                  : "upcoming"
              }`}
            >
              <div className="od-step-icon">🚜</div>
              <div className="od-step-info">
                <span className="od-step-title">Packed &amp; Dispatched</span>
                <span className="od-step-sub">Fresh from Farm</span>
              </div>
            </div>

            <div
              className={`od-step ${
                isDelivered
                  ? "completed"
                  : isShipped
                  ? "current"
                  : "upcoming"
              }`}
            >
              <div className="od-step-icon">🏡</div>
              <div className="od-step-info">
                <span className="od-step-title">Delivered</span>
                <span className="od-step-sub">Direct to Home</span>
              </div>
            </div>
          </div>

          {/* ACTION TOOLBAR */}
          <div className="od-action-bar">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="od-action-btn whatsapp cursor-pointer"
            >
              <span>📱</span> Share on WhatsApp
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="od-action-btn cursor-pointer"
            >
              <span>🖨️</span> Print Invoice
            </button>

            {isUpi && (
              <button
                type="button"
                onClick={() => setShowUpiModal(true)}
                className="od-action-btn cursor-pointer"
                style={{
                  background: "#f3e8ff",
                  borderColor: "#d8b4fe",
                  color: "#6b21a8",
                }}
              >
                <span>🟣</span> View PhonePe QR
              </button>
            )}

            <Link
              href="/marketplace"
              className="od-action-btn primary"
              style={{ marginLeft: "auto" }}
            >
              <span>🛍️</span> Continue Shopping
            </Link>
          </div>
        </div>

        {/* =========================================================
            TWO COLUMN GRID: PRODUCTS & CUSTOMER / SUMMARY
        ========================================================= */}
        <div className="od-grid">
          {/* LEFT COLUMN */}
          <div>
            {/* Customer Details Card */}
            <div className="od-card">
              <h2 className="od-card-title">
                <span>👤 Customer &amp; Delivery Information</span>
                {order.distanceKm > 0 && (
                  <span className="badge">
                    📍 ~{order.distanceKm} km from farm
                  </span>
                )}
              </h2>

              <div className="od-customer-grid">
                {order.customer.name && (
                  <div className="od-info-item">
                    <div className="od-info-label">Customer Name</div>
                    <div className="od-info-val">{order.customer.name}</div>
                  </div>
                )}

                {order.customer.phone && (
                  <div className="od-info-item">
                    <div className="od-info-label">Mobile Number</div>
                    <div className="od-info-val">📱 {order.customer.phone}</div>
                  </div>
                )}

                <div className="od-info-item" style={{ gridColumn: "1 / -1" }}>
                  <div className="od-info-label">Delivery Address</div>
                  <div className="od-info-val">
                    📍 {order.customer.address || "Address on file"}
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Products Card */}
            <div className="od-card">
              <h2 className="od-card-title">
                <span>🛒 Ordered Farm Products</span>
                <span className="badge">
                  {order.products.length}{" "}
                  {order.products.length === 1 ? "Product" : "Products"}
                </span>
              </h2>

              <div className="od-products-list">
                {order.products.map((product) => (
                  <div key={product.id} className="od-product-item">
                    <div className="od-product-img">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        "🌱"
                      )}
                    </div>

                    <div className="od-product-main">
                      <Link
                        href={`/products/${product.id}`}
                        className="od-product-name"
                      >
                        {product.name}
                      </Link>
                      <p className="od-product-price">
                        ₹{product.price.toFixed(2)} / {product.unit}
                      </p>
                    </div>

                    <div className="od-product-qty">
                      <div className="od-qty-label">Quantity</div>
                      <div className="od-qty-val">
                        {product.quantity} {product.unit}
                      </div>
                    </div>

                    <div className="od-product-subtotal">
                      ₹{(product.price * product.quantity).toFixed(2)}
                    </div>

                    {userRole === "customer" && (
                      <div style={{ width: "100%", marginTop: "6px" }}>
                        <button
                          type="button"
                          onClick={() => openFeedbackModal(product)}
                          className={`od-feedback-btn ${
                            product.reviewed ? "reviewed" : "not-reviewed"
                          }`}
                        >
                          {product.reviewed ? (
                            <>
                              <span>✓</span> Reviewed (★ {product.userRating}/5)
                              <span style={{ textDecoration: "underline" }}>
                                Edit
                              </span>
                            </>
                          ) : (
                            <>
                              <span>⭐</span> Rate &amp; Review Product
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

          {/* RIGHT COLUMN: SUMMARY */}
          <div>
            <aside className="od-summary-card">
              <h2 className="od-card-title" style={{ marginBottom: "12px" }}>
                <span>Order Summary</span>
              </h2>

              <div className="od-summary-row">
                <span>Products Subtotal</span>
                <strong>₹{order.subtotal.toFixed(2)}</strong>
              </div>

              <div className="od-summary-row">
                <span>
                  Delivery Charge{" "}
                  {order.distanceKm > 0 && (
                    <small style={{ color: "#64748b" }}>
                      ({order.distanceKm} km)
                    </small>
                  )}
                </span>
                <strong style={{ color: "#059669" }}>
                  ₹{order.deliveryCharge.toFixed(2)}
                </strong>
              </div>

              <div className="od-summary-divider" />

              <div className="od-summary-total">
                <span>Total Amount</span>
                <strong>₹{order.total.toFixed(2)}</strong>
              </div>

              {/* PAYMENT BOX */}
              <div className={`od-payment-box ${isUpi ? "upi" : ""}`}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: isUpi ? "#7e22ce" : "#64748b",
                    marginBottom: "4px",
                  }}
                >
                  Payment Method
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: isUpi ? "#581c87" : "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isUpi ? (
                    <>
                      <span>🟣</span> PhonePe UPI Payment
                    </>
                  ) : (
                    <>
                      <span>💵</span> Cash on Delivery
                    </>
                  )}
                </div>

                {isUpi && (
                  <button
                    type="button"
                    onClick={() => setShowUpiModal(true)}
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#7e22ce",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    View Scanned QR Details →
                  </button>
                )}
              </div>

              <div className="od-order-date">
                Order Placed On:{" "}
                <strong>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently"}
                </strong>
              </div>

              <Link
                href={userRole === "farmer" ? "/farmer/orders" : "/orders"}
                className="od-back-btn"
              >
                ← Back to All Orders
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTERACTIVE PHONEPE QR CODE MODAL
      ========================================================= */}
      {showUpiModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowUpiModal(false)}
        >
          <div
            style={{
              background: "#111827",
              color: "#fff",
              borderRadius: "28px",
              maxWidth: "420px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  background: "rgba(168, 85, 247, 0.2)",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#c084fc",
                }}
              >
                <span>🟣</span> PhonePe QR
              </div>
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                style={{
                  background: "#374151",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                width: "220px",
                height: "260px",
                margin: "0 auto 16px",
                background: "#000",
                borderRadius: "18px",
                padding: "8px",
                border: "2px solid #8b5cf6",
                boxShadow: "0 0 25px rgba(139, 92, 246, 0.4)",
              }}
            >
              <img
                src="/images/phonepe-qr.png"
                alt="PhonePe QR Code - Mahesh Rajendra Borde"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 4px" }}>
              Mahesh Rajendra Borde
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "12px", margin: "0 0 16px" }}>
              Scan &amp; Pay using PhonePe, GPay, or Paytm
            </p>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: "12px",
                borderRadius: "14px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                Order Amount
              </span>
              <strong style={{ fontSize: "20px", color: "#34d399" }}>
                ₹{order.total.toFixed(2)}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("maheshborde@phonepe");
                alert("UPI ID maheshborde@phonepe copied to clipboard!");
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "14px",
                background: "#8b5cf6",
                color: "#fff",
                border: "none",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              📋 Copy UPI ID: maheshborde@phonepe
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          FEEDBACK POPUP MODAL
      ========================================================= */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(5px)",
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
              background: "#ffffff",
              borderRadius: "26px",
              maxWidth: "480px",
              width: "100%",
              padding: "30px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
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
                    color: "#059669",
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
                    color: "#111827",
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
                  Your Rating:{" "}
                  <strong style={{ color: "#d97706" }}>
                    {hoverRating || rating} / 5 Stars
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
                  placeholder="ताजेपणा, गुणवत्ता, चव किंवा डिलिव्हरीचा अनुभव सांगा..."
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
                    background: "#059669",
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
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          Loading order details...
        </div>
      }
    >
      <OrderDetailsContent />
    </Suspense>
  );
}