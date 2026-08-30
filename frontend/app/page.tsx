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
              Discover fresh vegetables and fruits directly from
              local farmers. Support farmers, enjoy better prices,
              and bring farm-fresh products to your home.
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


          {/* HERO IMAGE */}

          <div className="hero-visual">

            <div className="hero-image-card">

              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85"
                alt="Fresh vegetables"
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


      {/* =====================================================
          FRESH PRODUCTS
          OLD STYLE + NEW PRODUCTS
      ===================================================== */}

      <section className="products-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              TODAY'S HARVEST
            </p>

            <h2>
              Fresh Products
              <span> From Our Farmers</span>
            </h2>

            <p className="section-description">
              Fresh vegetables and fruits directly from local farmers.
            </p>

          </div>

          <Link
            href="/marketplace"
            className="view-all-btn"
          >
            View All Products →
          </Link>

        </div>


        {/* ================= PRODUCT GRID ================= */}

        <div className="product-grid">


          {/* TOMATO */}

          <div className="product-card">

            <div className="product-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoPt4xnirklSN2t85C-NJ4uWm6zEJNvVHlm5SVcLseYA&s=100"
                alt="Fresh Tomato"
              />

              <span className="fresh-tag">
                🌱 Fresh
              </span>

            </div>

            <div className="product-info">

              <div className="product-category">
                VEGETABLES
              </div>
              <h3>
                Fresh Tomato
              </h3>

              <div className="product-price">
                ₹40
                <span>/ kg</span>
              </div>

              <p>
                Fresh farm tomatoes
              </p>

              <Link
                href="/marketplace"
                className="product-btn"
              >
                View Product →
              </Link>

            </div>

          </div>


          {/* POTATO */}

          <div className="product-card">

            <div className="product-image">

              <img
                src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=85"
                alt="Fresh Potato"
              />

              <span className="fresh-tag">
                🌱 Fresh
              </span>

            </div>

            <div className="product-info">

              <div className="product-category">
                VEGETABLES
              </div>

              <h3>
                Fresh Potato
              </h3>

              <div className="product-price">
                ₹30
                <span>/ kg</span>
              </div>

              <p>
                Quality farm potatoes
              </p>

              <Link
                href="/marketplace"
                className="product-btn"
              >
                View Product →
              </Link>

            </div>

          </div>


          
          {/* ================= ONION ================= */}

          <div className="product-card">

            <div className="product-image">

              <img
                src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=700&q=85"
                alt="Fresh Onion"
              />

              <span className="fresh-tag">
                🌱 Fresh
              </span>

            </div>

            <div className="product-info">

              <div className="product-category">
                VEGETABLES
              </div>

              <h3>
                Fresh Onion
              </h3>

              <div className="product-price">
                ₹35
                <span>/ kg</span>
              </div>

              <p>
                Fresh farm onions
              </p>

              <Link
                href="/marketplace"
                className="product-btn"
              >
                View Product →
              </Link>

            </div>

          </div>




          {/* ================= BANANA ================= */}

          <div className="product-card">

            <div className="product-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdntGaxbsuazE6DFs3G8UaDbw1_hxVlLw39vzw-SB9ww&s=1024"
                alt="Fresh Banana"
              />

              <span className="fresh-tag">
                🌱 Fresh
              </span>

            </div>

            <div className="product-info">

              <div className="product-category">
                FRUITS
              </div>

              <h3>
                Fresh Banana
              </h3>

              <div className="product-price">
                ₹50
                <span>/ dozen</span>
              </div>

              <p>
                Fresh farm bananas
              </p>

              <Link
                href="/marketplace"
                className="product-btn"
              >
                View Product →
              </Link>

            </div>

          </div>


          {/* ================= KOTHIMBIR ================= */}

          <div className="product-card">

            <div className="product-image">

              <img
                src="data:image/jpeg;base64,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"
                alt="Fresh Kothimbir"
              />

              <span className="fresh-tag">
                🌱 Fresh
              </span>

            </div>

            <div className="product-info">

              <div className="product-category">
                FRESH GREENS
              </div>

              <h3>
                Fresh Kothimbir
              </h3>

              <div className="product-price">
                ₹20
                <span>/ bunch</span>
              </div>

              <p>
                Fresh coriander leaves
              </p>

              <Link
                href="/marketplace"
                className="product-btn"
              >
                View Product →
              </Link>

            </div>

          </div>


          {/* ================= METHI ================= */}

          <div className="product-card">

            <div className="product-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPo3-c8ccDN_IpdCR038av84eFq60w1ZeGnZjgE-HKMA&s=1024"
                alt="Fresh Methi"
              />

              <span className="fresh-tag">
                🌱 Fresh
              </span>

            </div>

            <div className="product-info">

              <div className="product-category">
                FRESH GREENS
              </div>

              <h3>
                Fresh Methi
              </h3>

              <div className="product-price">
                ₹25
                <span>/ bunch</span>
              </div>

              <p>
                Fresh fenugreek leaves
              </p>

              <Link
                href="/marketplace"
                className="product-btn"
              >
                View Product →
              </Link>

            </div>

          </div>


          {/* ================= SHEPU ================= */}

          <div className="product-card">

            <div className="product-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRax0n6ETDfPmsQA7Q4Mcv-lWfDVOVxeQP5SWmPFHtnZA&s=1024"
                alt="Fresh Shepu"
              />

              <span className="fresh-tag">
                🌱 Fresh
              </span>

            </div>

            <div className="product-info">

              <div className="product-category">
                FRESH GREENS
              </div>

              <h3>
                Fresh Shepu
              </h3>

              <div className="product-price">
                ₹20
                <span>/ bunch</span>
              </div>

              <p>
                Fresh dill leaves
              </p>

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
            A simple digital platform connecting farmers
            and customers directly.
          </p>

        </div>


        <div className="steps">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              👨‍🌾
            </div>

            <h3>
              Farmer Joins
            </h3>

            <p>
              Farmers create their profile with location,
              contact information and farm details.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              🥕
            </div>

            <h3>
              Add Fresh Products
            </h3>

            <p>
              Farmers add their fresh vegetables and fruits
              with price, quantity and images.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              🛒
            </div>

            <h3>
              Customer Orders
            </h3>

            <p>
              Customers discover products, add them to cart
              and place orders easily.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              04
            </div>

            <div className="step-icon">
              📦
            </div>

            <h3>
              Order Delivered
            </h3>

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

              <span>
                🌱
              </span>

              <div>

                <strong>
                  Empowering Farmers
                </strong>

                <small>
                  Better reach • Better opportunities
                </small>

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


      {/* ================= BENEFITS ================= */}

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

            <div className="benefit-icon">
              🌱
            </div>

            <h3>
              Fresh Every Day
            </h3>

            <p>
              Farmers can update their available products
              and stock daily.
            </p>

          </div>


          <div className="benefit-card">

            <div className="benefit-icon">
              🤝
            </div>

            <h3>
              Direct Connection
            </h3>

            <p>
              Connect farmers and customers without
              unnecessary intermediaries.
            </p>

          </div>


          <div className="benefit-card">

            <div className="benefit-icon">
              📍
            </div>

            <h3>
              Know Your Farmer
            </h3>

            <p>
              Customers can discover farmer information
              and location.
            </p>

          </div>


          <div className="benefit-card">

            <div className="benefit-icon">
              📦
            </div>

            <h3>
              Easy Order Tracking
            </h3>

            <p>
              Customers can follow their order from
              placement to delivery.
            </p>

          </div>

        </div>

      </section>


      {/* ================= FINAL CTA ================= */}

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

            <Link
              href="/"
              className="logo"
            >
              <span className="logo-icon">
                🌱
              </span>

              Smart<span>Agri</span>
            </Link>

            <p>
              Connecting farmers directly with customers
              for a fresher and smarter agricultural future.
            </p>

          </div>


          <div className="footer-column">

            <h4>
              Platform
            </h4>

            <Link href="/">
              Home
            </Link>

            <Link href="/marketplace">
              Marketplace
            </Link>

            <Link href="/login">
              Login
            </Link>

            <Link href="/register">
              Register
            </Link>

          </div>


          <div className="footer-column">

            <h4>
              For Farmers
            </h4>

            <Link href="/register/farmer">
              Join as Farmer
            </Link>

            <Link href="/register/farmer">
              Sell Products
            </Link>

          </div>


          <div className="footer-column">

            <h4>
              Contact
            </h4>

            <span>
              📍 Maharashtra, India
            </span>

            <span>
              📧 ravibadwar@smartagri.com
            </span>

            <span>
              📞 +91 9921238590
            </span>

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