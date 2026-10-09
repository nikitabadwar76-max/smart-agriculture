"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../lib/api";
const products = [
  {
    id: 1,
    name: "Fresh Tomato",
    category: "Vegetables",
    price: 40,
    unit: "kg",
    farmer: "Ramesh Farm",
    location: "Kopargaon",
    quantity: 100,
    emoji: "🍅",
    description:
      "Fresh farm-grown tomatoes directly from the farmer. Carefully harvested and supplied fresh to customers.",
  },
  {
    id: 2,
    name: "Fresh Potato",
    category: "Vegetables",
    price: 30,
    unit: "kg",
    farmer: "Shivaji Farm",
    location: "Kopargaon",
    quantity: 80,
    emoji: "🥔",
    description:
      "Fresh quality potatoes harvested directly from our farm.",
  },
  {
    id: 3,
    name: "Fresh Onion",
    category: "Vegetables",
    price: 35,
    unit: "kg",
    farmer: "Ganesh Farm",
    location: "Rahata",
    quantity: 120,
    emoji: "🧅",
    description:
      "Good quality fresh onions directly from the farm.",
  },
  {
    id: 4,
    name: "Fresh Apple",
    category: "Fruits",
    price: 150,
    unit: "kg",
    farmer: "Green Valley Farm",
    location: "Nashik",
    quantity: 50,
    emoji: "🍎",
    description:
      "Fresh and naturally grown apples from our farm.",
  },
  {
    id: 5,
    name: "Fresh Banana",
    category: "Fruits",
    price: 60,
    unit: "dozen",
    farmer: "Krushi Farm",
    location: "Kopargaon",
    quantity: 70,
    emoji: "🍌",
    description:
      "Fresh naturally ripened bananas.",
  },
  {
    id: 6,
    name: "Wheat",
    category: "Grains",
    price: 45,
    unit: "kg",
    farmer: "Sai Farm",
    location: "Shirdi",
    quantity: 200,
    emoji: "🌾",
    description:
      "High-quality farm-grown wheat.",
  },
  {
    id: 7,
    name: "Green Chilli",
    category: "Vegetables",
    price: 80,
    unit: "kg",
    farmer: "Farm Fresh",
    location: "Kopargaon",
    quantity: 60,
    emoji: "🌶️",
    description:
      "Fresh spicy green chillies directly from the farmer.",
  },
  {
    id: 8,
    name: "Mango",
    category: "Fruits",
    price: 120,
    unit: "kg",
    farmer: "Mango Valley",
    location: "Nashik",
    quantity: 90,
    emoji: "🥭",
    description:
      "Fresh seasonal mangoes from the farm.",
  },
];

export default function ProductDetails() {

  const params = useParams();

  const id = Number(params.id);

  const product = products.find(
    (item) => item.id === id
  );
const [rating, setRating] = useState(5);
const [comment, setComment] = useState("");
const [feedback, setFeedback] = useState<any[]>([]);
const [feedbackMessage, setFeedbackMessage] = useState("");

useEffect(() => {
  const loadFeedback = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/product/${id}`
      );

      const data = await response.json();

      if (data.success) {
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error("Feedback Load Error:", error);
    }
  };

  if (id) {
    loadFeedback();
  }
}, [id]);

  if (!product) {

    return (

      <main className="product-not-found">

        <h1>
          Product Not Found
        </h1>

        <Link href="/marketplace">
          ← Back to Marketplace
        </Link>

      </main>
    );

  }

const submitFeedback = async () => {
  if (!comment.trim()) {
    setFeedbackMessage("Please enter your feedback.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    setFeedbackMessage("Please login to submit feedback.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: id,
        rating: rating,
        comment: comment,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setFeedbackMessage("Feedback submitted successfully!");
      setComment("");
      setRating(5);

      const result = await fetch(
        `${API_BASE_URL}/api/feedback/product/${id}`
      );
      const feedbackData = await result.json();

      if (feedbackData.success) {
        setFeedback(feedbackData.feedback || []);
      }
    } else {
      setFeedbackMessage(data.message || "Unable to submit feedback.");
    }
  } catch (error) {
    setFeedbackMessage("Something went wrong. Please try again.");
    console.error("Feedback Error:", error);
  }
};

  const addToCart = () => {

    const existingCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const existingProduct = existingCart.find(
      (item: any) => item.id === product.id
    );

    if (existingProduct) {

      existingProduct.quantity += 1;

    } else {

      existingCart.push({
        ...product,
        quantity: 1,
      });

    }

    localStorage.setItem(
      "cart",
      JSON.stringify(existingCart)
    );

    alert(`${product.name} added to cart!`);
  };


  return (

    <main className="product-details-page">

      {/* Header */}

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

          <Link href="/cart">
            🛒 Cart
          </Link>

          <Link href="/login">
            Login
          </Link>

        </nav>

      </header>


      {/* Product Details */}

      <section className="product-details">

        <Link
          href="/marketplace"
          className="back-market"
        >
          ← Back to Marketplace
        </Link>


        <div className="product-details-card">

          {/* Image */}

          <div className="details-image">

            <span>
              {product.emoji}
            </span>

            <div className="fresh-label">
              🌱 Fresh From Farm
            </div>

          </div>


          {/* Information */}

          <div className="details-info">

            <span className="details-category">
              {product.category}
            </span>

            <h1>
              {product.name}
            </h1>

            <div className="details-price">

              <strong>
                ₹{product.price}
              </strong>

              <span>
                / {product.unit}
              </span>

            </div>


            <div className="details-farmer">

              <div className="farmer-detail-avatar">
                👨‍🌾
              </div>

              <div>

                <small>
                  Sold by
                </small>

                <h3>
                  {product.farmer}
                </h3>

                <p>
                  📍 {product.location}
                </p>

              </div>

            </div>


            <div className="details-stock">

              <span>
                Available Stock
              </span>

              <strong>
                {product.quantity} {product.unit}
              </strong>

            </div>


            <div className="details-description">

              <h2>
                About this product
              </h2>

              <p>
                {product.description}
              </p>

            </div>

{/* Customer Feedback */}

<div className="details-description">
  <h2>⭐ Customer Feedback</h2>

  <label>Rate this product:</label>

  <div>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        style={{
          color: star <= rating ? "#f59e0b" : "#9ca3af",
          fontSize: "28px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
     ★
      </button>
    ))}
  </div>

  <textarea
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    placeholder="Write your feedback about this product..."
    rows={4}
    style={{
      width: "100%",
      padding: "12px",
      marginTop: "10px",
      border: "1px solid #ccc",
      borderRadius: "8px",
    }}
  />

  <button
    type="button"
    onClick={submitFeedback}
    style={{
      display: "block",
      marginTop: "12px",
      padding: "10px 20px",
      backgroundColor: "#15803d",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    Submit Feedback
  </button>

  {feedbackMessage && (
    <p style={{ marginTop: "10px" }}>
      {feedbackMessage}
    </p>
  )}

  <h3 style={{ marginTop: "24px" }}>Customer Reviews</h3>

  {feedback.length === 0 ? (
    <p>No reviews yet. Be the first to review!</p>
  ) : (
    feedback.map((item, index) => (
      <div
        key={item.feedback_id || index}
        style={{
          padding: "12px 0",
          borderBottom: "1px solid #ddd",
        }}
      >
        <strong>Rating: {"⭐".repeat(Number(item.rating) || 0)}</strong>
        <p>{item.comment}</p>
        {item.created_at && (
          <small>
            {new Date(item.created_at).toLocaleDateString("en-IN")}
          </small>
        )}
      </div>
    ))
  )}
</div>



            <div className="details-actions">

              <button
                className="details-cart"
                onClick={addToCart}
              >
                🛒 Add to Cart
              </button>

              <Link
                href="/cart"
                className="details-buy"
              >
                Buy Now
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}