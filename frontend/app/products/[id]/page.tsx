
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../lib/api";

interface Product {
  product_id: number;
  product_name: string;
  category: string;
  price: number | string;
  unit: string;
  stock: number | string;
  description?: string;
  image_url?: string | null;
  farmer_name?: string;
  farmer_mobile?: string;
}

export default function ProductDetails() {
  const params = useParams();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Load product from backend database
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `${API_BASE_URL}/api/products/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.product) {
          throw new Error(data.message || "Product not found.");
        }

        setProduct(data.product);
      } catch (error) {
        console.error("Product Load Error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    if (Number.isFinite(id) && id > 0) {
      loadProduct();
    } else {
      setErrorMessage("Invalid product ID.");
      setLoading(false);
    }
  }, [id]);

  // Add product to cart
  const addToCart = () => {
    if (!product) return;

    try {
      const existingCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const existingProduct = existingCart.find(
        (item: any) =>
          Number(item.id ?? item.product_id) === product.product_id
      );

      if (existingProduct) {
        existingProduct.quantity =
          Number(existingProduct.quantity || 0) + 1;
      } else {
        existingCart.push({
          ...product,
          id: product.product_id,
          name: product.product_name,
          farmer: product.farmer_name || "Local Farmer",
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(existingCart));

      alert(`${product.product_name} added to cart!`);
    } catch (error) {
      console.error("Add to Cart Error:", error);
      alert("Unable to add product to cart.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="product-not-found">
        <h1>Loading product...</h1>
      </main>
    );
  }

  // Product not found
  if (!product) {
    return (
      <main className="product-not-found">
        <h1>Product Not Found</h1>
        <p>{errorMessage}</p>
        <Link href="/marketplace">
          ← Back to Marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="product-details-page">
      {/* Header */}
      <header className="market-header">
        <Link href="/" className="market-logo">
          🌱 SmartAgri
        </Link>

        <nav>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/cart">🛒 Cart</Link>
          <Link href="/login">Login</Link>
        </nav>
      </header>

      {/* Product Details */}
      <section className="product-details">
        <Link href="/marketplace" className="back-market">
          ← Back to Marketplace
        </Link>

        <div className="product-details-card">
          {/* Product Image */}
          <div className="details-image">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.product_name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span style={{ fontSize: "90px" }}>🌱</span>
            )}

            <div className="fresh-label">
              🌱 Fresh From Farm
            </div>
          </div>

          {/* Product Information */}
          <div className="details-info">
            <span className="details-category">
              {product.category}
            </span>

            <h1>{product.product_name}</h1>

            <div className="details-price">
              <strong>
                ₹{Number(product.price).toLocaleString("en-IN")}
              </strong>

              <span>/ {product.unit}</span>
            </div>

            {/* Farmer Information */}
            <div className="details-farmer">
              <div className="farmer-detail-avatar">
                👨‍🌾
              </div>

              <div>
                <small>Sold by</small>

                <h3>
                  {product.farmer_name || "Local Farmer"}
                </h3>

                {product.farmer_mobile && (
                  <p>📞 {product.farmer_mobile}</p>
                )}
              </div>
            </div>

            {/* Available Stock */}
            <div className="details-stock">
              <span>Available Stock</span>

              <strong>
                {Number(product.stock).toLocaleString("en-IN")}{" "}
                {product.unit}
              </strong>
            </div>

            {/* Description */}
            <div className="details-description">
              <h2>About this product</h2>

              <p>
                {product.description ||
                  "Fresh farm product directly from the farmer."}
              </p>
            </div>

            {/* Product Actions */}
            <div className="details-actions">
              <button
                className="details-cart"
                onClick={addToCart}
                disabled={Number(product.stock) <= 0}
              >
                🛒 Add to Cart
              </button>

              <button
                className="details-buy"
                onClick={() => {
                  if (Number(product.stock) <= 0) {
                    alert("This product is out of stock.");
                    return;
                  }

                  addToCart();
                  window.location.href = "/cart";
                }}
                disabled={Number(product.stock) <= 0}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
