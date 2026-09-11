"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {

  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get("orderId");


  return (

    <main className="order-success-page">

      <header className="market-header">

        <Link
          href="/"
          className="market-logo"
        >
          🌱 SmartAgri
        </Link>

        <nav>

          <Link href="/marketplace">
            Marketplace
          </Link>

          <Link href="/login">
            Login
          </Link>

        </nav>

      </header>


      <section className="success-container">

        <div className="success-icon">
          ✓
        </div>


        <p className="hero-small">
          ORDER CONFIRMED
        </p>


        <h1>
          Thank You for Your Order! 🎉
        </h1>


        <p className="success-message">
          Your order has been successfully placed.
          The farmer will receive your order details
          and start preparing your products.
        </p>


        <div className="order-id-box">

          <span>
            Order ID
          </span>

          <strong>
            {orderId || "FD00000000"}
          </strong>

        </div>


        <div className="success-info">

          <div>
            📦
          </div>

          <div>

            <h3>
              What happens next?
            </h3>

            <p>
              The farmer will receive your order,
              prepare your products, and update the
              order status.
            </p>

          </div>

        </div>


        <div className="success-actions">

          <Link
            href="/marketplace"
            className="continue-shopping"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="home-button"
          >
            Go to Home
          </Link>

        </div>

      </section>

    </main>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={<main className="order-success-page" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}