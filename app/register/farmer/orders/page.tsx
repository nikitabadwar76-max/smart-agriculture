"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  emoji: string;
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

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [filter, setFilter] =
    useState("All");


  useEffect(() => {

    /*
      Temporary frontend data.

      Later Module 6 will get orders
      from the Express + MySQL backend.
    */

    const savedOrder =
      localStorage.getItem("lastOrder");

    if (savedOrder) {

      const order =
        JSON.parse(savedOrder);

      setOrders([order]);

    }

  }, []);


  const updateStatus = (
    orderId: string,
    newStatus: string
  ) => {

    const updatedOrders =
      orders.map((order) =>
        order.orderId === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      );

    setOrders(updatedOrders);


    /*
      Temporary storage.

      Later this will become:

      PUT /api/orders/:orderId/status
    */

    if (updatedOrders.length > 0) {

      localStorage.setItem(
        "lastOrder",
        JSON.stringify(updatedOrders[0])
      );

    }

  };


  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter(
          (order) =>
            order.status === filter
        );


  const pendingCount =
    orders.filter(
      (order) =>
        order.status === "Pending"
    ).length;


  const acceptedCount =
    orders.filter(
      (order) =>
        order.status === "Accepted"
    ).length;


  const completedCount =
    orders.filter(
      (order) =>
        order.status === "Completed"
    ).length;


  const totalSales =
    orders
      .filter(
        (order) =>
          order.status === "Completed"
      )
      .reduce(
        (total, order) =>
          total + order.total,
        0
      );


  return (

    <main className="farmer-orders-page">

      {/* Header */}

      <header className="market-header">

        <Link
          href="/"
          className="market-logo"
        >
          🌱 SmartAgri
        </Link>


        <nav>

          <Link href="/farmer">
            Dashboard
          </Link>

          <Link
            href="/farmer/orders"
            className="market-active"
          >
            Orders
          </Link>

          <Link href="/marketplace">
            Marketplace
          </Link>

        </nav>

      </header>


      {/* Main */}

      <section className="farmer-orders-container">

        <div className="farmer-page-heading">

          <div>

            <p className="hero-small">
              FARMER DASHBOARD
            </p>

            <h1>
              Customer Orders
            </h1>

            <p>
              Manage orders received directly from customers.
            </p>

          </div>


          <div className="farmer-welcome">
            👨‍🌾 Farmer Panel
          </div>

        </div>


        {/* Statistics */}

        <div className="order-statistics">

          <div className="order-stat-card">

            <div className="stat-icon pending-icon">
              🕐
            </div>

            <div>

              <span>
                Pending Orders
              </span>

              <strong>
                {pendingCount}
              </strong>

            </div>

          </div>


          <div className="order-stat-card">

            <div className="stat-icon accepted-icon">
              📦
            </div>

            <div>

              <span>
                Accepted
              </span>

              <strong>
                {acceptedCount}
              </strong>

            </div>

          </div>


          <div className="order-stat-card">

            <div className="stat-icon completed-icon">
              ✅
            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {completedCount}
              </strong>

            </div>

          </div>


          <div className="order-stat-card">

            <div className="stat-icon sales-icon">
              ₹
            </div>

            <div>

              <span>
                Completed Sales
              </span>

              <strong>
                ₹{totalSales.toLocaleString("en-IN")}
              </strong>

            </div>

          </div>

        </div>


        {/* Filter */}

        <div className="orders-toolbar">

          <div>

            <h2>
              Orders
            </h2>

            <p>
              Orders placed by customers
            </p>

          </div>


          <div className="order-filters">

            {[
              "All",
              "Pending",
              "Accepted",
              "Completed",
            ].map((status) => (

              <button
                key={status}
                className={
                  filter === status
                    ? "order-filter active"
                    : "order-filter"
                }
                onClick={() =>
                  setFilter(status)
                }
              >
                {status}
              </button>

            ))}

          </div>

        </div>


        {/* Orders */}

        {filteredOrders.length === 0 ? (

          <div className="no-orders">

            <div className="no-orders-icon">
              📦
            </div>

            <h2>
              No Orders Found
            </h2>

            <p>
              Customer orders will appear here after they place an order.
            </p>

            <Link
              href="/marketplace"
              className="continue-shopping"
            >
              View Marketplace
            </Link>

          </div>

        ) : (

          <div className="farmer-orders-list">

            {filteredOrders.map((order) => (

              <div
                className="farmer-order-card"
                key={order.orderId}
              >

                {/* Order Top */}

                <div className="farmer-order-top">

                  <div>

                    <span className="order-label">
                      ORDER ID
                    </span>

                    <h3>
                      #{order.orderId}
                    </h3>

                  </div>


                  <span
                    className={`order-status ${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>

                </div>


                {/* Customer */}

                <div className="customer-order-info">

                  <div>

                    <span>
                      CUSTOMER
                    </span>

                    <strong>
                      👤 {order.customer.name}
                    </strong>

                  </div>


                  <div>

                    <span>
                      PHONE
                    </span>

                    <strong>
                      📞 {order.customer.phone}
                    </strong>

                  </div>


                  <div>

                    <span>
                      DELIVERY
                    </span>

                    <strong>
                      📍 {order.customer.city}
                    </strong>

                  </div>


                  <div>

                    <span>
                      TOTAL
                    </span>

                    <strong className="order-total">
                      ₹
                      {order.total.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>


                {/* Products */}

                <div className="farmer-order-products">

                  <h4>
                    Products
                  </h4>

                  {order.products.map(
                    (product) => (

                      <div
                        className="farmer-product-row"
                        key={product.id}
                      >

                        <div className="farmer-product-emoji">
                          {product.emoji}
                        </div>

                        <div>

                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            {product.quantity}{" "}
                            {product.unit}
                          </span>

                        </div>

                        <strong>
                          ₹
                          {(
                            product.price *
                            product.quantity
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                    )
                  )}

                </div>


                {/* Bottom */}

                <div className="farmer-order-bottom">

                  <div className="payment-info">

                    💳{" "}
                    {order.paymentMethod ===
                    "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}

                  </div>


                  <div className="order-actions">

                    <Link
                      href={`/order-details?orderId=${order.orderId}`}
                      className="view-order-button"
                    >
                      View Details
                    </Link>


                    {order.status ===
                      "Pending" && (

                      <button
                        className="accept-order-button"
                        onClick={() =>
                          updateStatus(
                            order.orderId,
                            "Accepted"
                          )
                        }
                      >
                        ✓ Accept Order
                      </button>

                    )}


                    {order.status ===
                      "Accepted" && (

                      <button
                        className="complete-order-button"
                        onClick={() =>
                          updateStatus(
                            order.orderId,
                            "Completed"
                          )
                        }
                      >
                        ✓ Mark Completed
                      </button>

                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}