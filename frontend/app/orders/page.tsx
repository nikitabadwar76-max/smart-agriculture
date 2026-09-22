"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/api";

interface Order {
  order_id: number;
  customer_id: number;
  total_amount: number | string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  delivery_address: string;
  order_date: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const customerId =
        localStorage.getItem("customer_id");

      const userRole =
        localStorage.getItem("user_role");

      // Customer login check
      if (
        !customerId ||
        userRole !== "customer"
      ) {
        setError(
          "Please login as a customer to view your orders."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/orders/customer/${customerId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(data.orders || []);

    } catch (err: any) {
      console.error(
        "❌ Customer Orders Error:",
        err
      );

      setError(
        err.message ||
          "Failed to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusClass = (
    status: string
  ) => {
    const value =
      status?.toLowerCase();

    if (value === "delivered") {
      return "completed";
    }

    if (
      value === "confirmed" ||
      value === "processing" ||
      value === "shipped"
    ) {
      return "accepted";
    }

    if (value === "cancelled") {
      return "cancelled";
    }

    return "pending";
  };

  return (
    <div className="orders-page">

      {/* ================= HEADER ================= */}

      <header className="market-header">

        <Link
          href="/marketplace"
          className="market-logo"
        >
          🌱 SmartAgri
        </Link>

        <nav>

          <Link href="/marketplace">
            Marketplace
          </Link>

          <Link href="/cart">
            Cart
          </Link>

          <Link
            href="/orders"
            className="active"
          >
            Orders
          </Link>

        </nav>

      </header>


      {/* ================= MAIN ================= */}

      <main className="orders-container">

        {/* ================= TITLE ================= */}

        <div className="orders-header">

          <div>

            <p className="orders-label">
              Purchase History
            </p>

            <h1>
              My Orders
            </h1>

            <p>
              Track your purchases and view your
              complete order history.
            </p>

          </div>

          <div className="order-count">
            {orders.length}
          </div>

        </div>


        {/* ================= LOADING ================= */}

        {loading && (

          <div className="order-empty">

            <div className="no-orders-icon">
              🌱
            </div>

            <h2>
              Loading your orders...
            </h2>

            <p>
              Please wait while we load your
              order history.
            </p>

          </div>

        )}


        {/* ================= ERROR ================= */}

        {!loading && error && (

          <div className="order-empty">

            <div className="no-orders-icon">
              ⚠️
            </div>

            <h2>
              Unable to Load Orders
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={fetchCustomerOrders}
              className="view-order-btn"
            >
              Try Again
            </button>

          </div>

        )}


        {/* ================= NO ORDERS ================= */}

        {!loading &&
          !error &&
          orders.length === 0 && (

            <div className="order-empty">

              <div className="no-orders-icon">
                📦
              </div>

              <h2>
                No Orders Yet
              </h2>

              <p>
                You have not placed any orders yet.
              </p>

              <Link
                href="/marketplace"
                className="view-order-btn"
              >
                Start Shopping →
              </Link>

            </div>

          )}


        {/* ================= ORDERS ================= */}

        {!loading &&
          !error &&
          orders.length > 0 && (

            <div className="orders-list">

              {orders.map((order) => (

                <article
                  className="order-card"
                  key={order.order_id}
                >

                  {/* ORDER TOP */}

                  <div className="order-top">

                    <div>

                      <h2 className="order-number">
                        Order #{order.order_id}
                      </h2>

                      <p className="order-date">
                        {formatDate(
                          order.order_date
                        )}
                      </p>

                    </div>

                    <span
                      className={`order-status ${getStatusClass(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>

                  </div>


                  {/* ORDER INFORMATION */}

                  <div className="order-info">

                    <div className="order-info-item">

                      <span>
                        Payment
                      </span>

                      <strong>
                        {order.payment_method}
                      </strong>

                    </div>


                    <div className="order-info-item">

                      <span>
                        Payment Status
                      </span>

                      <strong>
                        {order.payment_status}
                      </strong>

                    </div>


                    <div className="order-info-item">

                      <span>
                        Delivery
                      </span>

                      <strong>
                        {order.delivery_address}
                      </strong>

                    </div>

                  </div>


                  {/* ================= TOTAL ================= */}

                  <div className="order-total">

                    <span>
                      Total Amount
                    </span>

                    <strong>
                      ₹
                      {Number(
                        order.total_amount
                      ).toFixed(2)}
                    </strong>

                  </div>


                  {/* ================= BUTTON ================= */}

                  <Link
                    href={`/order-details?orderId=${order.order_id}`}
                    className="view-order-btn"
                  >
                    View Order Details →
                  </Link>

                </article>

              ))}

            </div>

          )}

      </main>

    </div>
  );
}