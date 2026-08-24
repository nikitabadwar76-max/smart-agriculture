"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

export default function OrderDetailsPage() {

  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get("orderId");


  const [order, setOrder] =
    useState<Order | null>(null);


  useEffect(() => {

    const savedOrder =
      localStorage.getItem("lastOrder");

    if (savedOrder) {

      const parsedOrder =
        JSON.parse(savedOrder);

      if (
        !orderId ||
        parsedOrder.orderId === orderId
      ) {

        setOrder(parsedOrder);

      }

    }

  }, [orderId]);


  if (!order) {

    return (

      <main className="no-order-details">

        <div className="no-orders-icon">
          📦
        </div>

        <h1>
          Order Not Found
        </h1>

        <p>
          The requested order could not be found.
        </p>

        <Link
          href="/farmer/orders"
          className="continue-shopping"
        >
          Back to Orders
        </Link>

      </main>

    );

  }


  return (

    <main className="order-details-page">

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


      <section className="order-details-container">

        {/* Heading */}

        <div className="order-details-heading">

          <div>

            <p className="hero-small">
              ORDER DETAILS
            </p>

            <h1>
              #{order.orderId}
            </h1>

          </div>


          <span
            className={`order-status ${order.status.toLowerCase()}`}
          >
            {order.status}
          </span>

        </div>


        <div className="order-details-grid">

          {/* Left */}

          <div className="order-details-left">

            {/* Customer */}

            <div className="details-card">

              <h2>
                👤 Customer Information
              </h2>


              <div className="customer-details">

                <div>

                  <span>
                    Name
                  </span>

                  <strong>
                    {order.customer.name}
                  </strong>

                </div>


                <div>

                  <span>
                    Mobile
                  </span>

                  <strong>
                    {order.customer.phone}
                  </strong>

                </div>


                <div>

                  <span>
                    Address
                  </span>

                  <strong>
                    {order.customer.address}
                  </strong>

                </div>


                <div>

                  <span>
                    City
                  </span>

                  <strong>
                    {order.customer.city}
                  </strong>

                </div>


                <div>

                  <span>
                    PIN Code
                  </span>

                  <strong>
                    {order.customer.pincode}
                  </strong>

                </div>

              </div>

            </div>


            {/* Products */}

            <div className="details-card">

              <h2>
                🥕 Ordered Products
              </h2>


              <div className="details-products">

                {order.products.map(
                  (product) => (

                    <div
                      className="details-product"
                      key={product.id}
                    >

                      <div className="details-product-image">
                        {product.emoji}
                      </div>


                      <div className="details-product-info">

                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          ₹{product.price} /{" "}
                          {product.unit}
                        </p>

                      </div>


                      <div>

                        <span className="details-quantity">
                          Quantity
                        </span>

                        <strong>
                          {product.quantity}{" "}
                          {product.unit}
                        </strong>

                      </div>


                      <div className="details-product-total">

                        ₹
                        {(
                          product.price *
                          product.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>


          {/* Right */}

          <aside className="details-summary">

            <h2>
              Order Summary
            </h2>


            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {order.subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                Delivery
              </span>

              <strong>
                ₹{order.deliveryCharge}
              </strong>

            </div>


            <div className="summary-line" />


            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {order.total.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            <div className="payment-box">

              <span>
                PAYMENT
              </span>

              <strong>
                {order.paymentMethod ===
                "cod"
                  ? "💵 Cash on Delivery"
                  : "💳 Online Payment"}
              </strong>

            </div>


            <div className="order-date">

              Order placed:

              <strong>
                {new Date(
                  order.createdAt
                ).toLocaleString("en-IN")}
              </strong>

            </div>


            <Link
              href="/farmer/orders"
              className="back-orders-button"
            >
              ← Back to Orders
            </Link>

          </aside>

        </div>

      </section>

    </main>
  );
}