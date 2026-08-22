import Link from "next/link";

export default function FarmerDashboard() {
  return (
    <main className="farmer-dashboard">

      {/* Sidebar */}
      <aside className="farmer-sidebar">

        <div className="farmer-logo">
          🌱 FarmDirect
        </div>

        <div className="farmer-profile">
          <div className="farmer-avatar">👨‍🌾</div>

          <h3>Farmer</h3>

          <p>Farm Owner</p>
        </div>

        <nav className="farmer-nav">

          <Link href="/farmer/dashboard" className="active">
            🏠 Dashboard
          </Link>

          <Link href="/farmer/add-product">
            ➕ Add Product
          </Link>

          <Link href="/farmer/products">
            🌾 My Products
          </Link>

          <Link href="#">
            📦 Orders
          </Link>

          <Link href="#">
            👤 My Profile
          </Link>

        </nav>

        <Link href="/login" className="logout">
          🚪 Logout
        </Link>

      </aside>


      {/* Main Content */}
      <section className="dashboard-content">

        <div className="dashboard-top">

          <div>
            <p className="dashboard-label">
              FARMER DASHBOARD
            </p>

            <h1>Welcome, Farmer 👋</h1>

            <p>
              Manage your agricultural products and orders.
            </p>
          </div>

          <Link
            href="/farmer/add-product"
            className="add-product-btn"
          >
            + Add New Product
          </Link>

        </div>


        {/* Statistics */}

        <div className="dashboard-stats">

          <div className="dashboard-stat-card">
            <div className="stat-icon">🌾</div>

            <div>
              <span>Total Products</span>
              <strong>0</strong>
            </div>
          </div>


          <div className="dashboard-stat-card">
            <div className="stat-icon">📦</div>

            <div>
              <span>Total Orders</span>
              <strong>0</strong>
            </div>
          </div>


          <div className="dashboard-stat-card">
            <div className="stat-icon">💰</div>

            <div>
              <span>Total Sales</span>
              <strong>₹0</strong>
            </div>
          </div>


          <div className="dashboard-stat-card">
            <div className="stat-icon">⭐</div>

            <div>
              <span>Rating</span>
              <strong>0.0</strong>
            </div>
          </div>

        </div>


        {/* Quick Actions */}

        <section className="quick-section">

          <h2>Quick Actions</h2>

          <div className="quick-grid">

            <Link
              href="/farmer/add-product"
              className="quick-card"
            >
              <span>➕</span>

              <div>
                <h3>Add Product</h3>

                <p>
                  Add a new agricultural product.
                </p>
              </div>

              <b>→</b>
            </Link>


            <Link
              href="/farmer/products"
              className="quick-card"
            >
              <span>🌾</span>

              <div>
                <h3>My Products</h3>

                <p>
                  View and manage your products.
                </p>
              </div>

              <b>→</b>
            </Link>


            <Link
              href="#"
              className="quick-card"
            >
              <span>📦</span>

              <div>
                <h3>Orders</h3>

                <p>
                  Check customer orders.
                </p>
              </div>

              <b>→</b>
            </Link>

          </div>

        </section>


        {/* Information */}

        <section className="dashboard-info">

          <div className="info-icon">
            💡
          </div>

          <div>
            <h3>Start Selling Your Products</h3>

            <p>
              Add your agricultural products to FarmDirect.
              Customers will be able to discover and purchase
              your products directly from you.
            </p>

            <Link href="/farmer/add-product">
              Add your first product →
            </Link>
          </div>

        </section>

      </section>

    </main>
  );
}