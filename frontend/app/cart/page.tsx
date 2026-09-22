

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CartProduct {
  product_id: number;
  product_name: string;
  price: number;
  unit: string;
  quantity: number;
  image_url: string | null;
  farmer_id: number | null;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // ==========================================
  // LOAD CART
  // ==========================================

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error("❌ Error loading cart:", error);
      setCart([]);
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
  const count = cart.reduce(
    (total: number, item: CartProduct) =>
      total + Number(item.quantity || 0),
    0
  );

  setCartCount(count);
}, [cart]);

  // ==========================================
  // SAVE CART
  // ==========================================

  const saveCart = (updatedCart: CartProduct[]) => {
    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  };

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  const increaseQuantity = (productId: number) => {
    const updatedCart = cart.map((item) =>
      item.product_id === productId
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    saveCart(updatedCart);
  };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  const decreaseQuantity = (productId: number) => {
    const updatedCart = cart
      .map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
  };

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  const removeItem = (productId: number) => {
    const updatedCart = cart.filter(
      (item) => item.product_id !== productId
    );

    saveCart(updatedCart);
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("cart");
    setCart([]);
  };

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) * item.quantity,
    0
  );

  const deliveryCharge =
    subtotal > 0 ? 40 : 0;

  const total =
    subtotal + deliveryCharge;

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (!loaded) {
    return (
      <main className="cart-page">

        <div className="min-h-screen flex items-center justify-center">

          <div className="text-center">

            <div className="text-5xl mb-4">
              🛒
            </div>

            <h2 className="text-2xl font-bold">
              Loading your cart...
            </h2>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="cart-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="market-header">

        <Link href="/orders">
  Orders
</Link>

<Link href="/profile">
  Profile
</Link>

        <nav>

          <Link href="/marketplace">
            Marketplace
          </Link>
<Link href="/cart" className="market-active relative">
  <span className="relative">
    🛒
    {cartCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
        {cartCount}
      </span>
    )}
  </span>
  <span>Cart</span>
</Link>

          <Link href="/orders">
            Orders
          </Link>

          <Link href="/profile">
            Profile
          </Link>

        </nav>

      </header>


      {/* ======================================
          CART CONTENT
      ====================================== */}

      <section className="cart-container">

        {/* HEADING */}

        <div className="cart-heading">

          <div>

            <p className="hero-small">
              YOUR SHOPPING CART
            </p>

            <h1>
              Your Cart 🛒
            </h1>

            <p>
              Review your products before checkout.
            </p>

          </div>

          {cart.length > 0 && (
            <button
              className="clear-cart"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          )}

        </div>


        {/* ======================================
            EMPTY CART
        ====================================== */}

        {cart.length === 0 ? (

          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              You haven't added any products yet.
            </p>

            <Link
              href="/marketplace"
              className="continue-shopping"
            >
              Browse Marketplace →
            </Link>

          </div>

        ) : (

          /* ======================================
             CART WITH PRODUCTS
          ====================================== */

          <div className="cart-layout">

            {/* ==================================
                PRODUCTS
            ================================== */}

            <div className="cart-products">

              <div className="cart-products-header">

                <h2>
                  Cart Items
                </h2>

                <span>
                  {totalItems} item(s)
                </span>

              </div>


              {/* CART ITEMS */}

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.product_id}
                >

                  {/* PRODUCT IMAGE */}

                  <div className="cart-item-image">

                    {item.image_url ? (

                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover rounded-xl"
                      />

                    ) : (

                      <span>
                        🌱
                      </span>

                    )}

                  </div>


                  {/* PRODUCT DETAILS */}

                  <div className="cart-item-details">

                    <span className="cart-category">
                      Fresh Product
                    </span>

                    <h3>
                      {item.product_name}
                    </h3>

                    <p>
                      👨‍🌾 Farmer #{item.farmer_id || "N/A"}
                    </p>

                    <small>
                      Fresh farm product
                    </small>

                  </div>


                  {/* PRICE */}

                  <div className="cart-item-price">

                    <strong>
                      ₹
                      {Number(item.price).toFixed(2)}
                    </strong>

                    <span>
                      / {item.unit}
                    </span>

                  </div>


                  {/* QUANTITY */}

                  <div className="quantity-control">

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
                      {item.quantity}
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

                  <div className="item-total">

                    ₹
                    {(
                      Number(item.price) *
                      item.quantity
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}

                  </div>


                  {/* REMOVE */}

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() =>
                      removeItem(
                        item.product_id
                      )
                    }
                    title="Remove item"
                  >
                    🗑️
                  </button>

                </div>

              ))}


              {/* CONTINUE SHOPPING */}

              <Link
                href="/marketplace"
                className="continue-link"
              >
                ← Continue Shopping
              </Link>

            </div>


            {/* ==================================
                ORDER SUMMARY
            ================================== */}

            <aside className="order-summary">

              <h2>
                Order Summary
              </h2>


              {/* ITEMS */}

              <div className="summary-row">

                <span>
                  Items
                </span>

                <span>
                  {totalItems}
                </span>

              </div>


              {/* SUBTOTAL */}

              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>

              </div>


              {/* DELIVERY */}

              <div className="summary-row">

                <span>
                  Delivery
                </span>

                <strong>
                  ₹{deliveryCharge}
                </strong>

              </div>


              <div className="summary-line" />


              {/* TOTAL */}

              <div className="summary-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹
                  {total.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>

              </div>


              {/* CHECKOUT */}

              <Link
                href="/checkout"
                className="checkout-button"
              >
                Proceed to Checkout →
              </Link>


              {/* SECURITY */}

              <div className="secure-shopping">
                🔒 Secure & Safe Shopping
              </div>

            </aside>

          </div>

        )}

      </section>

    </main>
  );
}
