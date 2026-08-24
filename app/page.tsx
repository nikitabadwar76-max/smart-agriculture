import Link from "next/link";

export default function Home() {
  return (
    <main className="home-page">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <Link href="/" className="logo">
          <span className="logo-icon">🌱</span>
          Smart<span>Agri</span>
        </Link>

        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/register/farmer">For Farmers</Link>
          <Link href="#how-it-works">How It Works</Link>
        </div>

        <div className="nav-actions">
          <Link href="/login" className="login-btn">
            Login
          </Link>

          <Link href="/register" className="register-btn">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="hero-section">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="hero-text">

            <div className="hero-badge">
              <span>🌿</span>
              Fresh • Local • Direct
            </div>

            <h1>
              Fresh From
              <br />
              <span>Farm.</span>
              <br />
              Directly To You.
            </h1>

            <p className="hero-description">
              Discover fresh vegetables and fruits directly from local
              farmers. Support farmers, enjoy better prices, and bring
              farm-fresh products to your home.
            </p>

            <div className="hero-buttons">

              <Link
                href="/marketplace"
                className="primary-btn"
              >
                🛒 Explore Fresh Products
                <span>→</span>
              </Link>

              <Link
                href="/register/farmer"
                className="secondary-btn"
              >
                👨‍🌾 Join as Farmer
              </Link>

            </div>

            <div className="hero-trust">

              <div className="trust-item">
                <strong>100+</strong>
                <span>Fresh Products</span>
              </div>

              <div className="trust-line"></div>

              <div className="trust-item">
                <strong>50+</strong>
                <span>Local Farmers</span>
              </div>

              <div className="trust-line"></div>

              <div className="trust-item">
                <strong>500+</strong>
                <span>Orders</span>
              </div>

            </div>

          </div>

          {/* Hero visual */}
          <div className="hero-visual">

            <div className="hero-image-card">

              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85"
                alt="Fresh vegetables from local farmers"
              />

              <div className="fresh-badge">
                <span>🌱</span>
                <div>
                  <strong>Fresh Today</strong>
                  <small>Farm harvested</small>
                </div>
              </div>

              <div className="location-card">
                <span>📍</span>
                <div>
                  <small>Local Farmer</small>
                  <strong>Kopargaon, Maharashtra</strong>
                </div>
              </div>

            </div>

            <div className="floating-product product-one">
              🍅
              <div>
                <strong>Fresh Tomato</strong>
                <small>₹40 / kg</small>
              </div>
            </div>

            <div className="floating-product product-two">
              🥬
              <div>
                <strong>Fresh Vegetables</strong>
                <small>Available Today</small>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ================= QUICK FEATURES ================= */}
      <section className="quick-features">

        <div className="quick-feature">
          <div className="quick-icon">🌱</div>
          <div>
            <h3>Farm Fresh</h3>
            <p>Fresh products updated daily</p>
          </div>
        </div>

        <div className="quick-feature">
          <div className="quick-icon">👨‍🌾</div>
          <div>
            <h3>Direct From Farmers</h3>
            <p>Buy directly from local farmers</p>
          </div>
        </div>

        <div className="quick-feature">
          <div className="quick-icon">📍</div>
          <div>
            <h3>Local Farmers</h3>
            <p>Know where your food comes from</p>
          </div>
        </div>

        <div className="quick-feature">
          <div className="quick-icon">🛒</div>
          <div>
            <h3>Easy Ordering</h3>
            <p>Simple and convenient shopping</p>
          </div>
        </div>

      </section>


      {/* ================= FRESH PRODUCTS ================= */}
      <section className="products-section">

        <div className="section-heading">

          <div>
            <p className="section-label">TODAY'S HARVEST</p>

            <h2>
              Fresh Products
              <span> From Our Farmers</span>
            </h2>
          </div>

          <Link
            href="/marketplace"
            className="view-all-btn"
          >
            View Marketplace →
          </Link>

        </div>


        <div className="product-grid">

          <div className="product-card">

            <div className="product-image">
              <img
                src="https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=85"
                alt="Fresh tomatoes"
              />

              <span className="fresh-tag">
                🌱 Fresh Today
              </span>
            </div>

            <div className="product-info">

              <div className="product-category">
                VEGETABLE
              </div>

              <h3>Fresh Tomatoes</h3>

              <div className="product-price">
                ₹40 <span>/ kg</span>
              </div>

              <div className="farmer-info">
                <span>👨‍🌾</span>
                <div>
                  <strong>Rajesh Patil</strong>
                  <small>📍 Kopargaon</small>
                </div>
              </div>

              <Link
                href="/marketplace"
                className="product-btn"
              >
                View Product →
              </Link>

            </div>

          </div>


          <div className="product-card">

            <div className="product-image">
              <img
                src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=85"
                alt="Fresh potatoes"
              />

              <span className="fresh-tag">
                🌱 Fresh Today
              </span>
            </div>

            <div className="product-info">

              <div className="product-category">
                VEGETABLE
              </div>

              <h3>Fresh Potatoes</h3>

              <div className="product-price">
                ₹30 <span>/ kg</span>
              </div>

              <div className="farmer-info">
                <span>👨‍🌾</span>
                <div>
                  <strong>Suresh Jadhav</strong>
                  <small>📍 Shirdi</small>
                </div>
              </div>

              <Link
                href="/marketplace"
                className="product-btn"
              >
                View Product →
              </Link>

            </div>

          </div>


          <div className="product-card">

            <div className="product-image">
              <img
                src="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=85"
                alt="Fresh apples"
              />

              <span className="fresh-tag">
                🌱 Fresh Today
              </span>
            </div>

            <div className="product-info">

              <div className="product-category">
                FRUIT
              </div>

              <h3>Fresh Apples</h3>

              <div className="product-price">
                ₹120 <span>/ kg</span>
              </div>

              <div className="farmer-info">
                <span>👨‍🌾</span>
                <div>
                  <strong>Ganesh More</strong>
                  <small>📍 Nashik</small>
                </div>
              </div>

              <Link
                href="/marketplace"
                className="product-btn"
              >
                View Product →
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-heading center">

          <p className="section-label">
            HOW SMARTAGRI WORKS
          </p>

          <h2>
            From Farm
            <span> To Your Door</span>
          </h2>

          <p className="section-description">
            A simple digital platform connecting farmers and
            customers directly.
          </p>

        </div>


        <div className="steps">

          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">👨‍🌾</div>

            <h3>Farmer Joins</h3>

            <p>
              Farmers create their profile with location,
              contact information and farm details.
            </p>
          </div>


          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🥕</div>

            <h3>Add Fresh Products</h3>

            <p>
              Farmers add their fresh vegetables and fruits
              with price, quantity and images.
            </p>
          </div>


          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">🛒</div>

            <h3>Customer Orders</h3>

            <p>
              Customers discover products, add them to cart
              and place orders easily.
            </p>
          </div>


          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-icon">📦</div>

            <h3>Order Delivered</h3>

            <p>
              Farmers manage orders and customers can track
              their order status.
            </p>
          </div>

        </div>

      </section>


      {/* ================= FARMER SECTION ================= */}
      <section className="farmer-section">

        <div className="farmer-content">

          <div className="farmer-image">

            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85"
              alt="Farmer working in agricultural field"
            />

            <div className="farmer-floating-card">
              <span>🌱</span>
              <div>
                <strong>Empowering Farmers</strong>
                <small>Better reach • Better opportunities</small>
              </div>
            </div>

          </div>


          <div className="farmer-text">

            <p className="section-label">
              FOR FARMERS
            </p>

            <h2>
              Your Farm.
              <br />
              Your Products.
              <br />
              <span>Your Customers.</span>
            </h2>

            <p>
              SmartAgri gives farmers a digital platform to
              showcase their fresh products and connect directly
              with customers.
            </p>

            <div className="farmer-benefits">

              <div>
                <span>✓</span>
                Add products every day
              </div>

              <div>
                <span>✓</span>
                Update price and stock
              </div>

              <div>
                <span>✓</span>
                Receive customer orders
              </div>

              <div>
                <span>✓</span>
                Manage your farmer profile
              </div>

            </div>

            <Link
              href="/register/farmer"
              className="primary-btn farmer-btn"
            >
              Start Selling →
            </Link>

          </div>

        </div>

      </section>


      {/* ================= WHY SMARTAGRI ================= */}
      <section
        className="benefits-section"
        id="about"
      >

        <div className="section-heading center">

          <p className="section-label">
            WHY SMARTAGRI
          </p>

          <h2>
            Technology That
            <span> Connects Agriculture</span>
          </h2>

        </div>


        <div className="benefit-grid">

          <div className="benefit-card">
            <div className="benefit-icon">🌱</div>
            <h3>Fresh Every Day</h3>
            <p>
              Farmers can update their available products
              and stock daily.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🤝</div>
            <h3>Direct Connection</h3>
            <p>
              Connect farmers and customers without
              unnecessary intermediaries.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">📍</div>
            <h3>Know Your Farmer</h3>
            <p>
              Customers can discover farmer information
              and location.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">📦</div>
            <h3>Easy Order Tracking</h3>
            <p>
              Customers can follow their order from
              placement to delivery.
            </p>
          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="final-cta">

        <div className="cta-content">

          <p className="section-label">
            GROW WITH SMARTAGRI
          </p>

          <h2>
            Ready to Bring
            <br />
            <span>Freshness Home?</span>
          </h2>

          <p>
            Explore fresh products from local farmers
            or start selling your own agricultural products.
          </p>

          <div className="cta-buttons">

            <Link
              href="/marketplace"
              className="primary-btn"
            >
              🛒 Explore Marketplace
            </Link>

            <Link
              href="/register/farmer"
              className="cta-outline-btn"
            >
              👨‍🌾 Become a Farmer
            </Link>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="footer">

        <div className="footer-main">

          <div className="footer-brand">

            <Link href="/" className="logo">
              <span className="logo-icon">🌱</span>
              Smart<span>Agri</span>
            </Link>

            <p>
              Connecting farmers directly with customers
              for a fresher and smarter agricultural future.
            </p>

          </div>


          <div className="footer-column">

            <h4>Platform</h4>

            <Link href="/">Home</Link>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>

          </div>


          <div className="footer-column">

            <h4>For Farmers</h4>

            <Link href="/register/farmer">
              Join as Farmer
            </Link>

            <Link href="/register/farmer">
              Sell Products
            </Link>

          </div>


          <div className="footer-column">

            <h4>Contact</h4>

            <span>📍 Maharashtra, India</span>
            <span>📧 support@smartagri.com</span>
            <span>📞 +91 XXXXX XXXXX</span>

          </div>

        </div>


        <div className="footer-bottom">

          <p>
            © 2026 SmartAgri. Smart Agriculture Marketplace.
          </p>

          <p>
            Built for a smarter agricultural future 🌱
          </p>

        </div>

      </footer>

    </main>
  );
}