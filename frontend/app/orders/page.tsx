"use client";

import Link from "next/link";

const orders = [
  {
    id: "ORD1003",
    date: "22 Aug 2026 • 10:30 AM",
    status: "Completed",
    statusClass: "completed",
    payment: "Cash on Delivery",
    items: "3 Products",
    delivery: "Delivered",
    total: 305,
    button: "View Order Details →",
    products: [
      {
        name: "Fresh Tomatoes",
        quantity: "2 kg × ₹40",
        price: 80,
        image:
          "https://images.unsplash.com/photo-1546470427-e5ac89cd0b9d?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Fresh Potatoes",
        quantity: "3 kg × ₹35",
        price: 105,
        image:
          "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Fresh Vegetables",
        quantity: "2 kg × ₹60",
        price: 120,
        image:
          "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },

  {
    id: "ORD1002",
    date: "20 Aug 2026 • 03:45 PM",
    status: "Accepted",
    statusClass: "accepted",
    payment: "Cash on Delivery",
    items: "2 Products",
    delivery: "In Progress",
    total: 160,
    button: "Track Order →",
    products: [
      {
        name: "Organic Tomatoes",
        quantity: "2 kg × ₹45",
        price: 90,
        image:
          "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Fresh Onions",
        quantity: "2 kg × ₹35",
        price: 70,
        image:
          "https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },

  {
    id: "ORD1001",
    date: "18 Aug 2026 • 12:20 PM",
    status: "Pending",
    statusClass: "pending",
    payment: "Cash on Delivery",
    items: "1 Product",
    delivery: "Processing",
    total: 175,
    button: "View Order →",
    products: [
      {
        name: "Fresh Potatoes",
        quantity: "5 kg × ₹35",
        price: 175,
        image:
          "https://images.unsplash.com/photo-1518977956812-cd3db6f2f3a3?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
];

export default function OrdersPage() {
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

          <Link href="/profile">
            Profile
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


        {/* ================= ORDERS ================= */}

        <div className="orders-list">

          {orders.map((order) => (

            <article
              className="order-card"
              key={order.id}
            >

              {/* ORDER TOP */}

              <div className="order-top">

                <div>

                  <h2 className="order-number">
                    Order #{order.id}
                  </h2>

                  <p className="order-date">
                    {order.date}
                  </p>

                </div>

                <span
                  className={`order-status ${order.statusClass}`}
                >
                  {order.status}
                </span>

              </div>


              {/* ORDER INFORMATION */}

              <div className="order-info">

                <div className="order-info-item">

                  <span>
                    Payment
                  </span>

                  <strong>
                    {order.payment}
                  </strong>

                </div>


                <div className="order-info-item">

                  <span>
                    Items
                  </span>

                  <strong>
                    {order.items}
                  </strong>

                </div>


                <div className="order-info-item">

                  <span>
                    Delivery
                  </span>

                  <strong>
                    {order.delivery}
                  </strong>

                </div>

              </div>


              {/* ================= ITEMS ================= */}

              <div className="order-items">

                <h3 className="order-items-title">
                  Order Items
                </h3>


                {order.products.map(
                  (product, index) => (

                    <div
                      className="order-item"
                      key={`${order.id}-${index}`}
                    >

                      <div className="order-item-left">

                        <div className="order-item-image">

                          <img
                            src={product.image}
                            alt={product.name}
                          />

                        </div>


                        <div className="order-item-name">

                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            {product.quantity}
                          </span>

                        </div>

                      </div>


                      <div className="order-item-price">
                        ₹{product.price}
                      </div>

                    </div>

                  )
                )}

              </div>


              {/* ================= TOTAL ================= */}

              <div className="order-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹{order.total}
                </strong>

              </div>


              {/* ================= BUTTON ================= */}

              <Link
                href={`/order-details/${order.id}`}
                className="view-order-btn"
              >
                {order.button}
              </Link>

            </article>

          ))}

        </div>

      </main>

    </div>
  );
}