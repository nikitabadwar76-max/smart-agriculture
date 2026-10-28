"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  average_rating?: number | string;
  review_count?: number;
}

interface FeedbackItem {
  feedback_id: number;
  product_id: number;
  customer_id: number;
  order_id?: number | null;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at?: string;
  customer_name?: string;
  verified_purchase?: number | boolean;
}

interface FeedbackStats {
  average_rating: number;
  total_reviews: number;
  distribution: { [key: number]: number };
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params.id;
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);

  // Product State
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Feedback State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    average_rating: 0,
    total_reviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  // Form State
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [existingFeedbackId, setExistingFeedbackId] = useState<number | null>(
    null
  );

  // User Auth State
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentCustomerId, setCurrentCustomerId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("user_role"));
      const cid = localStorage.getItem("customer_id");
      if (cid) setCurrentCustomerId(Number(cid));
    }
  }, []);

  // ==========================================
  // LOAD PRODUCT DETAILS
  // ==========================================
  const loadProduct = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.product) {
        throw new Error(data.message || "Product not found.");
      }

      setProduct(data.product);
    } catch (error) {
      console.error("Product Load Error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load product."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD FEEDBACK & RATINGS
  // ==========================================
  const loadFeedback = async () => {
    try {
      setFeedbackLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/feedback/product/${id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setFeedbackList(data.feedback || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Feedback Load Error:", error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // ==========================================
  // CHECK USER EXISTING REVIEW
  // ==========================================
  const checkUserReview = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "customer") return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/check/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.reviewed && data.feedback) {
        setUserRating(Number(data.feedback.rating) || 5);
        setComment(data.feedback.comment || "");
        setExistingFeedbackId(data.feedback.feedback_id);
      }
    } catch (err) {
      console.error("Check review error:", err);
    }
  };

  useEffect(() => {
    if (Number.isFinite(id) && id > 0) {
      loadProduct();
      loadFeedback();
      checkUserReview();
    } else {
      setErrorMessage("Invalid product ID.");
      setLoading(false);
    }
  }, [id]);

  // ==========================================
  // SUBMIT OR UPDATE FEEDBACK
  // ==========================================
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");

    if (!token || role !== "customer") {
      setSubmitMessage({
        type: "error",
        text: "Please login as a customer to submit feedback.",
      });
      return;
    }

    if (userRating < 1 || userRating > 5) {
      setSubmitMessage({
        type: "error",
        text: "Please select a star rating from 1 to 5.",
      });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: id,
          rating: userRating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit feedback.");
      }

      setSubmitMessage({
        type: "success",
        text:
          data.message ||
          (existingFeedbackId
            ? "Your feedback was updated successfully!"
            : "Thank you! Your feedback was submitted successfully."),
      });

      // Reload feedback and product stats
      await loadFeedback();
      await loadProduct();
      await checkUserReview();
    } catch (err) {
      console.error("Submit feedback error:", err);
      setSubmitMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Something went wrong while submitting feedback.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // DELETE FEEDBACK
  // ==========================================
  const handleDeleteFeedback = async (feedbackId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your feedback?"
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/${feedbackId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setExistingFeedbackId(null);
        setComment("");
        setUserRating(5);
        setSubmitMessage({
          type: "success",
          text: "Your feedback was deleted.",
        });
        await loadFeedback();
        await loadProduct();
      } else {
        alert(data.message || "Failed to delete feedback");
      }
    } catch (err) {
      console.error("Delete feedback error:", err);
      alert("Error deleting feedback.");
    }
  };

  // ==========================================
  // ADD PRODUCT TO CART
  // ==========================================
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

  const starLabels: { [key: number]: string } = {
    1: "Poor 😞",
    2: "Fair 😐",
    3: "Good 😊",
    4: "Very Good 😃",
    5: "Excellent! 🌟",
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="text-6xl animate-bounce mb-4">🌱</div>
        <h1 className="text-2xl font-bold text-gray-700">
          Loading product details...
        </h1>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🥕</div>
        <h1 className="text-3xl font-extrabold text-gray-800">
          Product Not Found
        </h1>
        <p className="text-gray-500 mt-2 mb-6">
          {errorMessage || "The product you requested does not exist."}
        </p>
        <Link
          href="/marketplace"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition"
        >
          ← Back to Marketplace
        </Link>
      </main>
    );
  }

  const avgScore = Number(product.average_rating || stats.average_rating || 0);
  const totalCount = Number(product.review_count ?? stats.total_reviews ?? 0);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* NAVBAR */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-extrabold text-green-700"
          >
            🌱 SmartAgri
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/marketplace"
              className="text-gray-600 hover:text-green-600 font-medium"
            >
              Marketplace
            </Link>
            <Link
              href="/cart"
              className="text-gray-600 hover:text-green-600 font-medium"
            >
              🛒 Cart
            </Link>
            <Link
              href="/orders"
              className="text-gray-600 hover:text-green-600 font-medium"
            >
              Orders
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-green-600 font-medium"
            >
              Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
        <Link
          href="/marketplace"
          className="text-green-700 hover:underline font-semibold flex items-center gap-1 text-sm"
        >
          ← Back to Marketplace
        </Link>
      </div>

      {/* PRODUCT MAIN SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          {/* IMAGE */}
          <div className="flex flex-col items-center justify-center bg-green-50/50 rounded-2xl p-6 relative overflow-hidden min-h-[360px]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-full h-80 object-cover rounded-xl shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="text-9xl">🌱</div>
            )}

            <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              🌱 Direct from Farm
            </div>
          </div>

          {/* DETAILS */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="bg-green-100 text-green-700 font-bold text-xs px-3.5 py-1.5 rounded-full">
                  {product.category}
                </span>

                {Number(product.stock) > 0 ? (
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    In Stock ({product.stock} {product.unit})
                  </span>
                ) : (
                  <span className="text-red-500 text-sm font-semibold">
                    ● Out of Stock
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
                {product.product_name}
              </h1>

              {/* RATINGS HEADER BADGE */}
              <div className="flex items-center gap-3 mt-3">
                <a
                  href="#customer-reviews"
                  className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-full text-amber-800 text-sm font-bold transition"
                >
                  <span className="text-amber-500 text-base">★</span>
                  <span>{avgScore > 0 ? avgScore.toFixed(1) : "New"}</span>
                  <span className="text-gray-400 font-normal">|</span>
                  <span className="text-gray-600 font-semibold underline text-xs">
                    {totalCount > 0
                      ? `${totalCount} ${
                          totalCount === 1 ? "review" : "reviews"
                        }`
                      : "Be first to review"}
                  </span>
                </a>

                <div className="flex text-amber-400 text-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= Math.round(avgScore) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-green-700">
                  ₹{Number(product.price).toFixed(2)}
                </span>
                <span className="text-gray-500 font-semibold text-lg">
                  / {product.unit}
                </span>
              </div>

              {/* Farmer Info */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 mt-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-emerald-200">
                  👨‍🌾
                </div>
                <div>
                  <div className="text-xs uppercase font-extrabold text-emerald-800 tracking-wider">
                    Harvested by
                  </div>
                  <div className="text-gray-900 font-bold text-base">
                    {product.farmer_name || "Verified Local Farmer"}
                  </div>
                  {product.farmer_mobile && (
                    <div className="text-xs text-gray-600 mt-0.5">
                      📞 {product.farmer_mobile}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                  About this Product
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {product.description ||
                    "Fresh, high-quality agricultural product harvested with care and delivered directly to consumers."}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={addToCart}
                disabled={Number(product.stock) <= 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-600/25 transition active:scale-[0.99]"
              >
                🛒 Add to Cart
              </button>

              <button
                type="button"
                onClick={() => {
                  if (Number(product.stock) <= 0) {
                    alert("This product is currently out of stock.");
                    return;
                  }
                  addToCart();
                  router.push("/cart");
                }}
                disabled={Number(product.stock) <= 0}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-900/25 transition active:scale-[0.99]"
              >
                ⚡ Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CUSTOMER REVIEWS & FEEDBACK SECTION */}
      {/* ========================================================= */}
      <section
        id="customer-reviews"
        className="max-w-7xl mx-auto px-6 mt-12 scroll-mt-24"
      >
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-extrabold tracking-widest text-green-700">
              Community Ratings
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
              Customer Feedback &amp; Reviews 🌟
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Real reviews from customers who purchased or tried this product.
            </p>
          </div>

          <a
            href="#write-review"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-green-600/20 text-sm transition"
          >
            ✍️ {existingFeedbackId ? "Update Your Review" : "Write a Review"}
          </a>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Average Score Box */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="text-6xl font-black text-gray-900 tracking-tight">
              {avgScore > 0 ? avgScore.toFixed(1) : "0.0"}
            </div>

            <div className="flex text-amber-400 text-2xl my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= Math.round(avgScore) ? "★" : "☆"}
                </span>
              ))}
            </div>

            <p className="text-gray-500 font-medium text-sm">
              Based on {totalCount} verified{" "}
              {totalCount === 1 ? "review" : "reviews"}
            </p>

            {totalCount === 0 && (
              <span className="mt-3 text-xs bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full">
                🌱 Newly Added Product
              </span>
            )}
          </div>

          {/* Star Distribution Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
              Rating Breakdown
            </h3>

            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                const percentage =
                  totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-12 font-bold text-gray-700 flex items-center gap-1">
                      {star} <span className="text-amber-500">★</span>
                    </span>

                    <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <span className="w-16 text-right text-xs text-gray-500 font-semibold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* GRID: WRITE FEEDBACK FORM + REVIEWS LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* WRITE FEEDBACK FORM */}
          <div className="lg:col-span-1">
            <div
              id="write-review"
              className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-md sticky top-24 scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">
                  {existingFeedbackId ? "✏️" : "⭐"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {existingFeedbackId
                      ? "Edit Your Feedback"
                      : "Leave Product Feedback"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Your rating helps other customers and farmers.
                  </p>
                </div>
              </div>

              {/* If not logged in as customer */}
              {userRole !== "customer" ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center mt-4">
                  <div className="text-3xl mb-2">👤</div>
                  <h4 className="font-bold text-gray-800 text-sm">
                    Customer Login Required
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 mb-4">
                    Please log in as a customer to rate and review this product.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition"
                  >
                    Login as Customer →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                  {/* STAR SELECTOR */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Your Rating:{" "}
                      <span className="text-green-700 font-extrabold text-sm">
                        {starLabels[hoverRating || userRating]}
                      </span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= (hoverRating || userRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 focus:outline-none transition transform hover:scale-125 cursor-pointer"
                            aria-label={`Rate ${star} stars`}
                          >
                            <span
                              className={`text-3xl ${
                                active ? "text-amber-400" : "text-gray-200"
                              }`}
                            >
                              ★
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* COMMENT */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Your Comments / Feedback
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share details about product freshness, quality, packaging or delivery..."
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  {/* MESSAGES */}
                  {submitMessage && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-semibold ${
                        submitMessage.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {submitMessage.text}
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-green-600/25 transition active:scale-[0.99] cursor-pointer"
                  >
                    {submitting
                      ? "Submitting Feedback..."
                      : existingFeedbackId
                      ? "Update Feedback"
                      : "Submit Feedback"}
                  </button>

                  {existingFeedbackId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFeedback(existingFeedbackId)}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      🗑️ Delete My Review
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* REVIEWS LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  Reviews ({feedbackList.length})
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                  Showing all verified community reviews
                </span>
              </div>

              {feedbackLoading ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="text-4xl animate-spin mb-3">🌱</div>
                  <p>Loading feedback...</p>
                </div>
              ) : feedbackList.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-5xl mb-3">💬</div>
                  <h4 className="text-lg font-bold text-gray-700">
                    No reviews yet
                  </h4>
                  <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                    Be the first customer to try this fresh product and leave
                    your valuable rating and review!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 space-y-6">
                  {feedbackList.map((item) => {
                    const isOwnReview =
                      currentCustomerId !== null &&
                      Number(item.customer_id) === currentCustomerId;

                    return (
                      <article
                        key={item.feedback_id}
                        className="pt-6 first:pt-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-base">
                              {(item.customer_name || "C")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900 text-sm">
                                  {item.customer_name || "Customer"}
                                </h4>
                                {isOwnReview && (
                                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                                {item.verified_purchase ? (
                                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                    ✓ Verified Purchase
                                  </span>
                                ) : null}
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex text-amber-400 text-sm">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star}>
                                      {star <= item.rating ? "★" : "☆"}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400">
                                  {item.created_at
                                    ? new Date(
                                        item.created_at
                                      ).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isOwnReview && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteFeedback(item.feedback_id)
                              }
                              className="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold"
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        {item.comment ? (
                          <p className="mt-3 text-gray-700 text-sm leading-relaxed pl-14">
                            {item.comment}
                          </p>
                        ) : (
                          <p className="mt-2 text-gray-400 text-xs italic pl-14">
                            Rating only, no written comment.
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
