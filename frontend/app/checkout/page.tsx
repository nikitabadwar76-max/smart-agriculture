"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

interface CartItem {
  product_id: number;
  product_name: string;
  price: number | string;
  unit: string;
  quantity: number;
  image_url?: string | null;
  farmer_id?: number | null;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    mobile: "",
    address: "",
    payment_method: "Cash on Delivery",
  });

  // =========================================================
  // LOAD CART + CUSTOMER
  // =========================================================

  useEffect(() => {
    try {
      // Load cart
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }

      // Load customer ID
      const savedCustomerId =
        localStorage.getItem("customer_id") ||
        localStorage.getItem("customerId");

      if (savedCustomerId) {
        const id = Number(savedCustomerId);

        if (!Number.isNaN(id)) {
          setCustomerId(id);
        }
      }

      // Load customer name
      const savedName =
        localStorage.getItem("customer_name") ||
        localStorage.getItem("customerName") ||
        "";

      setFormData((previous) => ({
        ...previous,
        customer_name: savedName,
      }));
    } catch (error) {
      console.error("❌ Checkout loading error:", error);
    }
  }, []);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryCharge = subtotal > 0 ? 40 : 0;

  const totalAmount = subtotal + deliveryCharge;

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // -----------------------------
    // Check cart
    // -----------------------------

    if (cart.length === 0) {
      alert("Your cart is empty.");
      router.push("/cart");
      return;
    }

    // -----------------------------
    // Check customer
    // -----------------------------

    if (!customerId) {
      alert("Customer information not found. Please login first.");
      router.push("/login");
      return;
    }

    // -----------------------------
    // Check form
    // -----------------------------

    if (
      !formData.customer_name.trim() ||
      !formData.mobile.trim() ||
      !formData.address.trim()
    ) {
      alert("Please fill all required details.");
      return;
    }

    setLoading(true);

    try {
      // =====================================================
      // PREPARE ORDER ITEMS
      // =====================================================

      const items = cart.map((item) => ({
        product_id: Number(item.product_id),

        farmer_id:
          item.farmer_id !== null &&
          item.farmer_id !== undefined
            ? Number(item.farmer_id)
            : 0,

        quantity: Number(item.quantity),

        price: Number(item.price),
      }));

      // =====================================================
      // ORDER DATA
      // =====================================================

      const orderData = {
        customer_id: Number(customerId),

        total_amount: Number(
          totalAmount.toFixed(2)
        ),

        payment_method:
          formData.payment_method,

        delivery_address:
          formData.address.trim(),

        items,
      };

      console.log(
        "📦 Sending Order:",
        orderData
      );

      // =====================================================
      // SEND ORDER TO NODE BACKEND
      // =====================================================

      const response = await fetch(
        `${API_BASE_URL}/api/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(orderData),
        }
      );

      // =====================================================
      // GET RAW RESPONSE
      // =====================================================

      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "RESPONSE URL:",
        response.url
      );

      const text = await response.text();

      console.log(
        "RAW RESPONSE:",
        text
      );

      // =====================================================
      // CHECK RESPONSE
      // =====================================================

      let data: {
        success?: boolean;
        message?: string;
        order_id?: number;
      };

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "❌ Server returned HTML instead of JSON"
        );

        throw new Error(
          `Backend returned an invalid response. Status: ${response.status}`
        );
      }

      console.log(
        "📥 Order Response:",
        data
      );

      // =====================================================
      // CHECK API SUCCESS
      // =====================================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to place order"
        );
      }

      // =====================================================
      // ORDER SUCCESS
      // =====================================================

      console.log(
        "✅ Order placed successfully"
      );

      // Clear cart
      localStorage.removeItem("cart");

      setCart([]);

      // Save order ID
      if (data.order_id) {
        localStorage.setItem(
          "last_order_id",
          String(data.order_id)
        );
      }

      // Success message
      alert(
        "🎉 Order placed successfully!"
      );

      // Redirect
      router.push("/order-success");
    } catch (error) {
      console.error(
        "❌ Place Order Error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while placing order.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

        <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">

          <div className="text-6xl mb-5">
            🛒
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mt-3">
            Please add some fresh products before checkout.
          </p>

          <button
            onClick={() =>
              router.push("/marketplace")
            }
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
          >
            Browse Products
          </button>

        </div>

      </main>
    );
  }

  // =========================================================
  // CHECKOUT PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-50 py-10">

      <div className="max-w-6xl mx-auto px-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              router.push("/cart")
            }
            className="text-green-600 font-semibold mb-4"
          >
            ← Back to Cart
          </button>

          <h1 className="text-4xl font-bold text-gray-800">
            Checkout
          </h1>

          <p className="text-gray-500 mt-2">
            Complete your details and place your order.
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================================================
              CUSTOMER FORM
          ================================================= */}

          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl shadow-md p-8">

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🚚 Delivery Details
              </h2>

              <form
                onSubmit={handlePlaceOrder}
                className="space-y-5"
              >

                {/* NAME */}

                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />

                </div>

                {/* MOBILE */}

                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />

                </div>

                {/* ADDRESS */}

                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    Delivery Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete delivery address"
                    rows={5}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />

                </div>

                {/* PAYMENT */}

                <div>

                  <label className="block font-semibold text-gray-700 mb-2">
                    Payment Method
                  </label>

                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500"
                  >

                    <option value="Cash on Delivery">
                      💵 Cash on Delivery
                    </option>

                    <option value="UPI">
                      📱 UPI
                    </option>

                  </select>

                </div>

                {/* PLACE ORDER */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-lg transition"
                >

                  {loading
                    ? "⏳ Placing Order..."
                    : "🛍️ Place Order"}

                </button>

              </form>

            </div>

          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div>

            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🧾 Order Summary
              </h2>

              <div className="space-y-4">

                {cart.map((item) => (

                  <div
                    key={item.product_id}
                    className="flex gap-3 border-b pb-4"
                  >

                    {/* IMAGE */}

                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">

                      {item.image_url ? (

                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🌱
                        </div>

                      )}

                    </div>

                    {/* DETAILS */}

                    <div className="flex-1">

                      <h3 className="font-semibold text-gray-800">
                        {item.product_name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {item.quantity} × ₹
                        {Number(item.price).toFixed(2)}
                      </p>

                    </div>

                    {/* ITEM TOTAL */}

                    <div className="font-bold text-gray-800">

                      ₹
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}

                    </div>

                  </div>

                ))}

              </div>

              {/* =================================================
                  TOTALS
              ================================================= */}

              <div className="space-y-3 mt-6">

                <div className="flex justify-between text-gray-600">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal.toFixed(2)}
                  </span>

                </div>

                <div className="flex justify-between text-gray-600">

                  <span>
                    Delivery
                  </span>

                  <span>
                    ₹{deliveryCharge.toFixed(2)}
                  </span>

                </div>

                <div className="border-t pt-4 flex justify-between">

                  <span className="text-xl font-bold text-gray-800">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-green-600">
                    ₹{totalAmount.toFixed(2)}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}