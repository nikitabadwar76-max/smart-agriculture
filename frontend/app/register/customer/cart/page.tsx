"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  product_id: number | string;
  product_name: string;
  price: number | string;
  unit?: string;
  quantity: number | string;
  image_url?: string | null;
}

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // =========================================
  // LOAD CART
  // =========================================
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error("Cart loading error:", error);
      setCart([]);
    }

    setMounted(true);
  }, []);

  // =========================================
  // SAVE CART
  // =========================================
  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // =========================================
  // INCREASE
  // =========================================
  const increaseQuantity = (productId: number | string) => {
    const updatedCart = cart.map((item) => {
      if (String(item.product_id) === String(productId)) {
        return {
          ...item,
          quantity: Number(item.quantity) + 1,
        };
      }

      return item;
    });

    saveCart(updatedCart);
  };

  // =========================================
  // DECREASE
  // =========================================
  const decreaseQuantity = (productId: number | string) => {
    const updatedCart = cart
      .map((item) => {
        if (String(item.product_id) === String(productId)) {
          return {
            ...item,
            quantity: Number(item.quantity) - 1,
          };
        }

        return item;
      })
      .filter((item) => Number(item.quantity) > 0);

    saveCart(updatedCart);
  };

  // =========================================
  // REMOVE
  // =========================================
  const removeItem = (productId: number | string) => {
    const updatedCart = cart.filter(
      (item) =>
        String(item.product_id) !== String(productId)
    );

    saveCart(updatedCart);
  };

  // =========================================
  // CLEAR CART
  // =========================================
  const clearCart = () => {
    localStorage.removeItem("cart");
    setCart([]);
  };

  // =========================================
  // TOTAL ITEMS
  // =========================================
  const itemCount = cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  // =========================================
  // SUBTOTAL
  // =========================================
  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) * Number(item.quantity),
    0
  );

  // =========================================
  // LOADING
  // =========================================
  if (!mounted) {
    return (
      <main className="cart-page">
        <div className="cart-loading">
          <div className="loading-icon">🌱</div>
          <h2>Loading Your Cart...</h2>
          <p>Preparing your fresh harvest...</p>
        </div>
      </main>
    );
  }

  // =========================================
  // EMPTY CART
  // =========================================
  if (cart.length === 0) {
    return (
      <main className="cart-page">

        {/* NAVBAR */}
        <header className="farm-navbar">
          <div
            className="farm-logo"
            onClick={() => router.push("/")}
          >
            <span className="farm-logo-icon">
              🚜
            </span>

            <div>
              <strong>FarmDirect</strong>
              <small>Fresh from Farmers</small>
            </div>
          </div>

          <nav className="farm-nav">
            <button onClick={() => router.push("/")}>
              Home
            </button>

            <button
              onClick={() =>
                router.push("/marketplace")
              }
            >
              Marketplace
            </button>

            <button className="nav-cart-active">
              🛒 Cart
            </button>
          </nav>

          <button
            className="get-started-btn"
            onClick={() =>
              router.push("/marketplace")
            }
          >
            Get Started
          </button>
        </header>

        {/* EMPTY */}
        <section className="empty-cart-new">

          <div className="empty-cart-circle">
            🛒
          </div>

          <span>YOUR HARVEST</span>

          <h1>Your Cart is Empty</h1>

          <p>
            Discover fresh vegetables and fruits
            directly from local farmers.
          </p>

          <button
            className="main-orange-btn"
            onClick={() =>
              router.push("/marketplace")
            }
          >
            Explore Fresh Products →
          </button>

        </section>
      </main>
    );
  }

  // =========================================
  // MAIN CART
  // =========================================
  return (
    <main className="cart-page">

      {/* =====================================
          NAVBAR
      ====================================== */}
      <header className="farm-navbar">

        {/* LOGO */}
        <div
          className="farm-logo"
          onClick={() => router.push("/")}
        >
          <span className="farm-logo-icon">
            🚜
          </span>

          <div>
            <strong>FarmDirect</strong>
            <small>Fresh from Farmers</small>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="farm-nav">

          <button
            onClick={() => router.push("/")}
          >
            Home
          </button>

          <button
            onClick={() =>
              router.push("/marketplace")
            }
          >
            Marketplace
          </button>

          <button className="nav-cart-active">
            🛒 Cart
            <span className="cart-number">
              {itemCount}
            </span>
          </button>

        </nav>

        {/* RIGHT BUTTON */}
        <button
          className="get-started-btn"
          onClick={() =>
            router.push("/marketplace")
          }
        >
          Get Started
        </button>

      </header>

      {/* =====================================
          BREADCRUMB
      ====================================== */}
      <div className="cart-breadcrumb">
        <button onClick={() => router.push("/")}>
          Home
        </button>

        <span>›</span>

        <strong>Cart</strong>
      </div>

      {/* =====================================
          PAGE TITLE
      ====================================== */}
      <section className="cart-title-section">

        <h1>
          Review Your Harvest
          <span>🥕</span>
        </h1>

        <p>
          Fresh products picked directly from
          local farmers.
        </p>

      </section>

      {/* =====================================
          CART LAYOUT
      ====================================== */}
      <section className="cart-layout">

        {/* =================================
            LEFT PRODUCTS
        ================================== */}
        <div className="cart-items-column">

          {cart.map((item, index) => {

            const quantity =
              Number(item.quantity);

            const price =
              Number(item.price);

            const itemTotal =
              price * quantity;

            return (
              <article
                className="harvest-card"
                key={`${String(item.product_id)}-${index}`}
              >

                {/* IMAGE */}
                <div className="harvest-image">

                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                    />
                  ) : (
                    <div className="harvest-placeholder">
                      🌱
                    </div>
                  )}

                </div>

                {/* PRODUCT INFO */}
                <div className="harvest-info">

                  <span className="harvest-category">
                    FRESH PRODUCE
                  </span>

                  <h2>
                    {item.product_name}
                  </h2>

                  <p className="harvest-description">
                    Farm Fresh
                    {item.unit
                      ? ` • ${item.unit}`
                      : ""}
                  </p>

                  <div className="harvest-price">
                    ₹{price.toFixed(2)}
                    <span>
                      {" "}
                      / {item.unit || "kg"}
                    </span>
                  </div>

                </div>

                {/* QUANTITY */}
                <div className="harvest-quantity">

                  <button
                    type="button"
                    onClick={() =>
                      decreaseQuantity(
                        item.product_id
                      )
                    }
                  >
                    −
                  </button>

                  <span>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      increaseQuantity(
                        item.product_id
                      )
                    }
                  >
                    +
                  </button>

                </div>

                {/* ITEM TOTAL */}
                <div className="harvest-total">
                  ₹{itemTotal.toFixed(2)}
                </div>

                {/* REMOVE */}
                <button
                  type="button"
                  className="harvest-remove"
                  onClick={() =>
                    removeItem(item.product_id)
                  }
                  aria-label={`Remove ${item.product_name}`}
                >
                  ×
                </button>

              </article>
            );
          })}

          {/* =================================
              ADD MORE PRODUCTS
          ================================== */}
          <div className="add-products-box">

            <div className="add-product-icon">
              🥚
            </div>

            <div className="add-product-text">
              <strong>
                Add More Fresh Products?
              </strong>

              <p>
                Explore vegetables and fruits
                from local farmers.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/marketplace")
              }
            >
              Add Products
            </button>

          </div>

          {/* CONTINUE */}
          <button
            type="button"
            className="continue-shopping"
            onClick={() =>
              router.push("/marketplace")
            }
          >
            ← Continue Shopping
          </button>

        </div>

        {/* =================================
            RIGHT SUMMARY
        ================================== */}
        <aside className="harvest-summary">

          <div className="summary-top-line"></div>

          <div className="summary-content">

            <span className="summary-mini-title">
              YOUR ORDER
            </span>

            <h2>
              Weekly Summary
            </h2>

            {/* ITEMS */}
            <div className="summary-detail-row">

              <span>
                Items
              </span>

              <strong>
                {itemCount}
              </strong>

            </div>

            {/* SUBTOTAL */}
            <div className="summary-detail-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>

            </div>

            {/* DELIVERY */}
            <div className="summary-detail-row">

              <span>
                Delivery
              </span>

              <strong className="free-text">
                ✓ Free
              </strong>

            </div>

            {/* COUPON */}
            <button
              type="button"
              className="coupon-row"
            >
              🏷️ Have a coupon code?
              <span>⌄</span>
            </button>

            <div className="summary-divider"></div>

            {/* TOTAL */}
            <div className="summary-grand-total">

              <span>
                Total
              </span>

              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>

            </div>

            {/* CHECKOUT */}
            <button
              type="button"
              className="summary-checkout-btn"
              onClick={() =>
                router.push("/checkout")
              }
            >
              Checkout Now
              <span>→</span>
            </button>

            <p className="summary-note">
              Fresh products • Farmer direct
              <br />
              Quality you can trust.
            </p>

            {/* CLEAR */}
            <button
              type="button"
              className="summary-clear-btn"
              onClick={clearCart}
            >
              🗑 Clear Cart
            </button>

          </div>

        </aside>

      </section>

      {/* =====================================
          FOOTER
      ====================================== */}
      <footer className="cart-footer">

        <div className="footer-logo">
          🚜 <strong>FarmDirect</strong>
        </div>

        <p>
          Fresh from farmers. Straight to your
          doorstep.
        </p>

      </footer>

    </main>
  );
}