"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  product_id: number;
  product_name: string;
  category: string;
  price: string | number;
  stock: string | number;
  unit: string;
  status: string;
  image_url: string | null;
}

export default function MyProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // GET PRODUCTS FROM MYSQL
  // ==========================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch products"
          );
        }

        setProducts(data.products);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="farmer-dashboard">

      {/* Sidebar */}

      <aside className="farmer-sidebar">

        <div className="farmer-logo">
          🌱 SmartAgri
        </div>

        <div className="farmer-profile">

          <div className="farmer-avatar">
            👨‍🌾
          </div>

          <h3>Farmer</h3>

          <p>Farm Owner</p>

        </div>

        <nav className="farmer-nav">

          <Link href="/farmer/dashboard">
            🏠 Dashboard
          </Link>

          <Link href="/farmer/add-product">
            ➕ Add Product
          </Link>

          <Link
            href="/farmer/products"
            className="active"
          >
            🌾 My Products
          </Link>

          <Link href="/farmer/orders">
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


      {/* Content */}

      <section className="dashboard-content">

        <div className="dashboard-top">

          <div>

            <p className="dashboard-label">
              PRODUCT MANAGEMENT
            </p>

            <h1>My Products</h1>

            <p>
              Manage products you are selling.
            </p>

          </div>

          <Link
            href="/farmer/add-product"
            className="add-product-btn"
          >
            + Add Product
          </Link>

        </div>


        {/* Product Table */}

        <div className="products-table-card">

          <div className="table-header">

            <h2>Products</h2>

            <span>
              {loading
                ? "Loading..."
                : `${products.length} Products`}
            </span>

          </div>


          {/* Loading */}

          {loading && (
            <div className="product-list">

              <div className="product-row">

                <div className="product-info">

                  <h3>
                    Loading products...
                  </h3>

                  <p>
                    Getting products from database
                  </p>

                </div>

              </div>

            </div>
          )}


          {/* Error */}

          {!loading && error && (
            <div className="product-list">

              <div className="product-row">

                <div className="product-info">

                  <h3>
                    ❌ Unable to load products
                  </h3>

                  <p>
                    Make sure the backend server is running.
                  </p>

                </div>

              </div>

            </div>
          )}


          {/* No Products */}

          {!loading &&
            !error &&
            products.length === 0 && (

              <div className="product-list">

                <div className="product-row">

                  <div className="product-info">

                    <h3>
                      No products found
                    </h3>

                    <p>
                      Add your first farm product.
                    </p>

                  </div>

                </div>

              </div>
            )}


          {/* Products */}

          {!loading &&
            !error &&
            products.map((product) => (

              <div
                className="product-list"
                key={product.product_id}
              >

                <div className="product-row">

                  {/* Product Image / Emoji */}

                  <div className="product-image">

                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "inherit",
                        }}
                      />
                    ) : (
                      "🌱"
                    )}

                  </div>


                  {/* Product Info */}

                  <div className="product-info">

                    <h3>
                      {product.product_name}
                    </h3>

                    <p>
                      {product.category}
                    </p>

                  </div>


                  {/* Price */}

                  <div className="product-price">

                    <strong>
                      ₹{Number(product.price).toFixed(2)}
                    </strong>

                    <span>
                      / {product.unit}
                    </span>

                  </div>


                  {/* Stock */}

                  <div className="product-stock">

                    <span>
                      Stock
                    </span>

                    <strong>
                      {Number(product.stock)} {product.unit}
                    </strong>

                  </div>


                  {/* Status */}

                  <div>

                    <span className="available-badge">
                      ●{" "}
                      {product.status === "available"
                        ? "Available"
                        : product.status === "out_of_stock"
                        ? "Out of Stock"
                        : "Inactive"}
                    </span>

                  </div>


                  {/* Actions */}

                  <div className="product-actions">

                    <button>
                      ✏️
                    </button>

                    <button>
                      🗑️
                    </button>

                  </div>

                </div>

              </div>

            ))}

        </div>

      </section>

    </main>
  );
}