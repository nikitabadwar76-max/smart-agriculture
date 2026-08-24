"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  farmer: string;
};

type Order = {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  status: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem("orders");

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "status-pending";

      case "Accepted":
        return "status-accepted";

      case "Preparing":
        return "status-preparing";

      case "Ready":
        return "status-ready";

      case "Out for Delivery":
        return "status-delivery";

      case "Delivered":
        return "status-delivered";

      case "Rejected":
        return "status-rejected";

      default:
        return "";
    }
  };

  return (
    <main className="orders-page">

      {/* Header */}

      <header className="market-header">

        <Link href="/" className="market-logo">
          🌱 SmartAgri
        </Link>

        <nav>
          <Link href="/marketplace">
            Marketplace
          </Link>

          <Link href="/cart">
            🛒 Cart
          </Link>

          <Link href="/orders" className="market-active">
            My Orders
          </Link>

          <Link href="/login">
            Login
          </Link>
        </nav>

      </header>


      {/* Page */}

      <section className="orders-container">

        <div className="orders-heading">

          <p className="hero-small">
            CUSTOMER ORDERS
          </p>

          <h1>
            My Orders 📦
          </h1>

          <p>
            Track all your orders placed directly
            with farmers.
          </p>

        </div>


        {orders.length === 0 ? (

          <div className="empty-orders">

            <div className="empty-icon">
              📦
            </div>

            <h2>
              No Orders Yet
            </h2>

            <p>
              You haven't placed any orders yet.
            </p>

            <Link
              href="/marketplace"
              className="primary-button"
            >
              Browse Marketplace →
            </Link>

          </div>

        ) : (

          <div className="orders-list">

            {orders.map((order) => (

              <div
                className="order-card"
                key={order.id}
              >

                {/* Order Header */}

                <div className="order-header">

                  <div>

                    <h2>
                      Order #{order.id}
                    </h2>

                    <p>
                      {order.date}
                    </p>

                  </div>

                  <span
                    className={`order-status ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                </div>


                {/* Products */}

                <div className="order-items">

                  {order.items.map((item) => (

                    <div
                      className="order-item"
                      key={item.id}
                    >

                      <div>

                        <strong>
                          {item.name}
                        </strong>

                        <p>
                          Farmer: {item.farmer}
                        </p>

                        <p>
                          Quantity: {item.quantity}{" "}
                          {item.unit}
                        </p>

                      </div>

                      <strong>
                        ₹
                        {item.price *
                          item.quantity}
                      </strong>

                    </div>

                  ))}

                </div>


                {/* Order Footer */}

                <div className="order-footer">

                  <div>

                    <p>
                      Delivery: ₹{order.delivery}
                    </p>

                    <strong>
                      Total: ₹{order.total}
                    </strong>

                  </div>

                  <Link
                    href={`/order-details?id=${order.id}`}
                    className="view-order-button"
                  >
                    View Details
                  </Link>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}