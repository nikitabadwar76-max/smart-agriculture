"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  // Distance & Delivery State
  const [distanceKm, setDistanceKm] = useState<number>(5);

  // UPI Interactive State
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);

  // =========================================================
  // LOAD CART + CUSTOMER
  // =========================================================
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }

      const savedCustomerId =
        localStorage.getItem("customer_id") ||
        localStorage.getItem("customerId");

      if (savedCustomerId) {
        const id = Number(savedCustomerId);
        if (!Number.isNaN(id)) {
          setCustomerId(id);
        }
      }

      const savedName =
        localStorage.getItem("customer_name") ||
        localStorage.getItem("customerName") ||
        "";

      const savedMobile =
        localStorage.getItem("customer_mobile") ||
        localStorage.getItem("customerMobile") ||
        "";

      const savedAddress =
        localStorage.getItem("customer_address") ||
        localStorage.getItem("customerAddress") ||
        "";

      setFormData((prev) => ({
        ...prev,
        customer_name: savedName,
        mobile: prev.mobile || savedMobile,
        address: prev.address || savedAddress,
      }));
    } catch (error) {
      console.error("❌ Checkout loading error:", error);
    }
  }, []);

  // =========================================================
  // CALCULATIONS (DISTANCE BASED DELIVERY)
  // =========================================================
  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

  const calculateDeliveryCharge = (km: number): number => {
    if (subtotal === 0) return 0;
    if (km <= 5) return 25; // Local delivery
    if (km <= 15) return 50; // City delivery
    if (km <= 30) return 85; // Outer / Taluka
    return Math.round(85 + (km - 30) * 3); // Long distance
  };

  const deliveryCharge = calculateDeliveryCharge(distanceKm);
  const totalAmount = subtotal + deliveryCharge;

  const getEstimatedTime = (km: number): string => {
    if (km <= 5) return "30 - 45 mins (Instant Delivery)";
    if (km <= 15) return "1 - 2 hours (Same Day)";
    if (km <= 30) return "3 - 5 hours (Same Day Farm Dispatch)";
    return "Next Morning Fresh Delivery";
  };

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

  const copyUpiId = () => {
    navigator.clipboard.writeText("maheshborde@phonepe");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSimulateUpiSuccess = () => {
    setVerifyingUpi(true);
    setTimeout(() => {
      setVerifyingUpi(false);
      setIsUpiVerified(true);
      if (!utrNumber) {
        setUtrNumber(`UPI${Date.now().toString().slice(-8)}`);
      }
    }, 1200);
  };

  // =========================================================
  // PLACE ORDER
  // =========================================================
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      router.push("/cart");
      return;
    }

    if (!customerId) {
      alert("Customer information not found. Please login first.");
      router.push("/login");
      return;
    }

    if (
      !formData.customer_name.trim() ||
      !formData.mobile.trim() ||
      !formData.address.trim()
    ) {
      alert("Please fill all required delivery details.");
      return;
    }

    if (formData.payment_method === "UPI" && !isUpiVerified && !utrNumber.trim()) {
      const confirmProceed = window.confirm(
        "You selected UPI payment. Would you like to confirm that you have scanned and paid ₹" +
          totalAmount.toFixed(2) +
          " to Mahesh Rajendra Borde?"
      );
      if (!confirmProceed) return;
    }

    setLoading(true);

    try {
      const items = cart.map((item) => ({
        product_id: Number(item.product_id),
        farmer_id:
          item.farmer_id !== null && item.farmer_id !== undefined
            ? Number(item.farmer_id)
            : 0,
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

      const orderData = {
        customer_id: Number(customerId),
        total_amount: Number(totalAmount.toFixed(2)),
        delivery_charge: Number(deliveryCharge.toFixed(2)),
        distance_km: Number(distanceKm),
        payment_method:
          formData.payment_method === "UPI" && utrNumber
            ? `UPI (Ref: ${utrNumber})`
            : formData.payment_method,
        delivery_address: `${formData.address.trim()} (Dist: ~${distanceKm} km)`,
        items,
      };

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to place order");
      }

      // Clear cart
      localStorage.removeItem("cart");
      setCart([]);

      if (data.order_id) {
        localStorage.setItem("last_order_id", String(data.order_id));
      }
      if (formData.mobile.trim()) {
        localStorage.setItem("customer_mobile", formData.mobile.trim());
      }
      if (formData.customer_name.trim()) {
        localStorage.setItem("customer_name", formData.customer_name.trim());
      }

      // Redirect directly to confirmation
      if (data.order_id) {
        router.push(`/order-success?orderId=${data.order_id}`);
      } else {
        router.push("/order-success");
      }
    } catch (error: any) {
      console.error("❌ Place Order Error:", error);
      alert(error?.message || "Something went wrong while placing order.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EMPTY CART
  // =========================================================
  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7faf5] flex items-center justify-center px-6">
        <div className="bg-white shadow-xl rounded-3xl p-10 text-center max-w-md w-full border border-emerald-100">
          <div className="text-6xl mb-5">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800">Your Cart is Empty</h1>
          <p className="text-gray-500 mt-3">
            Please add fresh farm products before checkout.
          </p>
          <button
            onClick={() => router.push("/marketplace")}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-md cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faf5] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="text-emerald-700 hover:text-emerald-800 font-semibold mb-3 inline-flex items-center gap-1.5 transition"
          >
            ← Back to Cart
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Checkout &amp; Delivery
          </h1>
          <p className="text-gray-500 mt-1">
            Fresh produce delivered directly from local farmers to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =================================================
              LEFT: DELIVERY DETAILS & PAYMENT
          ================================================= */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>📍</span> Delivery Information
              </h2>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* NAME & MOBILE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      placeholder="उदा. महेश बोरडे"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="उदा. 9876543210"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Complete Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="घर क्रमांक, गल्ली/रस्ता, परिसर, लँडमार्क, गाव/शहर, पिनकोड..."
                    rows={3}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* DISTANCE SELECTOR (DYNAMIC DELIVERY CHARGE) */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                        Distance-Based Delivery Charge (अंतरावर आधारित डिलिव्हरी)
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg">
                        Distance: {distanceKm} km
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Delivery Fee:</span>
                      <div className="text-2xl font-black text-emerald-700">
                        ₹{deliveryCharge}
                      </div>
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {[
                      { km: 3, label: "🛵 Local (0-5 km)", fee: "₹25" },
                      { km: 12, label: "🚚 City (5-15 km)", fee: "₹50" },
                      { km: 25, label: "🚛 Suburbs (15-30 km)", fee: "₹85" },
                      { km: 40, label: "🚜 Rural (30+ km)", fee: "₹115+" },
                    ].map((pill) => (
                      <button
                        key={pill.km}
                        type="button"
                        onClick={() => setDistanceKm(pill.km)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                          (pill.km <= 5 && distanceKm <= 5) ||
                          (pill.km === 12 && distanceKm > 5 && distanceKm <= 15) ||
                          (pill.km === 25 && distanceKm > 15 && distanceKm <= 30) ||
                          (pill.km === 40 && distanceKm > 30)
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-gray-700 border-emerald-200 hover:bg-emerald-100/50"
                        }`}
                      >
                        <div>{pill.label}</div>
                        <div className="text-[11px] opacity-80">{pill.fee}</div>
                      </button>
                    ))}
                  </div>

                  {/* Range Slider for precise KM */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 font-semibold">
                      <span>1 km (Nearby Farm)</span>
                      <span>50 km (Outstation)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <p className="mt-3 text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                    <span>⏱️</span> Estimated Time:{" "}
                    <strong>{getEstimatedTime(distanceKm)}</strong>
                  </p>
                </div>

                {/* PAYMENT METHOD */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          payment_method: "Cash on Delivery",
                        }))
                      }
                      className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition cursor-pointer ${
                        formData.payment_method === "Cash on Delivery"
                          ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-3xl">💵</span>
                      <div>
                        <div className="font-bold text-base">Cash on Delivery</div>
                        <div className="text-xs text-gray-500">
                          Pay in cash when products arrive
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          payment_method: "UPI",
                        }))
                      }
                      className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition cursor-pointer ${
                        formData.payment_method === "UPI"
                          ? "border-purple-600 bg-purple-50/50 text-purple-950 font-bold shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-3xl">📱</span>
                      <div>
                        <div className="font-bold text-base flex items-center gap-1.5">
                          UPI / PhonePe QR
                          <span className="bg-purple-600 text-white text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded">
                            Instant
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Scan with PhonePe, GPay, Paytm
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* =================================================
                    INTERACTIVE UPI / PHONEPE SCANNER CARD
                ================================================= */}
                {formData.payment_method === "UPI" && (
                  <div className="bg-gradient-to-b from-gray-900 to-black text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-500/30 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* PhonePe QR Code Container */}
                      <div className="relative group flex-shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
                        <div className="relative w-56 h-72 sm:w-60 sm:h-76 bg-black rounded-2xl overflow-hidden border border-purple-400/50 p-2 flex flex-col items-center justify-between">
                          <img
                            src="/images/phonepe-qr.png"
                            alt="PhonePe QR Code - Mahesh Rajendra Borde"
                            className="w-full h-full object-contain rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Payment Details & Interaction */}
                      <div className="flex-1 text-center sm:text-left space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30">
                          <span>🟣</span> PhonePe Accepted Here
                        </div>

                        <h3 className="text-2xl font-black text-white">
                          Mahesh Rajendra Borde
                        </h3>

                        <p className="text-sm text-gray-300">
                          Scan the QR Code using <strong>PhonePe</strong>,{" "}
                          <strong>Google Pay</strong>, or <strong>Paytm</strong>{" "}
                          app to complete your payment.
                        </p>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                          <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold">
                            Amount to Pay
                          </span>
                          <span className="text-3xl font-extrabold text-emerald-400">
                            ₹{totalAmount.toFixed(2)}
                          </span>
                        </div>

                        {/* Copy UPI ID */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={copyUpiId}
                            className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>📋</span>
                            {copiedUpi ? "UPI ID Copied!" : "Copy UPI: maheshborde@phonepe"}
                          </button>
                        </div>

                        {/* UTR / Verification Input */}
                        <div className="pt-2">
                          <label className="block text-xs font-semibold text-gray-300 mb-1">
                            Enter 12-digit UPI Ref / UTR No. (Optional):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              placeholder="e.g. 430129849201"
                              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-400"
                            />
                            <button
                              type="button"
                              onClick={handleSimulateUpiSuccess}
                              disabled={verifyingUpi || isUpiVerified}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                isUpiVerified
                                  ? "bg-emerald-500 text-white"
                                  : "bg-purple-500 hover:bg-purple-600 text-white"
                              }`}
                            >
                              {verifyingUpi
                                ? "Verifying..."
                                : isUpiVerified
                                ? "✓ Verified"
                                : "⚡ Verify"}
                            </button>
                          </div>
                        </div>

                        {isUpiVerified && (
                          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                            <span>✅</span> Payment Verified! Ready to place order.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-black py-4 rounded-2xl text-lg shadow-lg shadow-emerald-600/30 transition duration-200 transform active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin text-xl">⏳</span> Placing
                      Order...
                    </span>
                  ) : (
                    <span>🛍️ Confirm &amp; Place Order (₹{totalAmount.toFixed(2)})</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* =================================================
              RIGHT: ORDER SUMMARY
          ================================================= */}
          <div>
            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center justify-between">
                <span>🧾 Order Summary</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  {cart.length} {cart.length === 1 ? "Item" : "Items"}
                </span>
              </h2>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product_id} className="py-3 flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 flex-shrink-0 flex items-center justify-center text-xl">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "🌱"
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.quantity} {item.unit} × ₹
                        {Number(item.price).toFixed(2)}
                      </p>
                    </div>

                    <div className="font-bold text-gray-900 text-sm">
                      ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>
                    Delivery ({distanceKm} km)
                  </span>
                  <span className="font-semibold text-emerald-700">
                    ₹{deliveryCharge.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Payment</span>
                  <span className="font-semibold text-gray-900">
                    {formData.payment_method === "UPI" ? "📱 UPI" : "💵 COD"}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-800">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black text-emerald-700">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Quality Guarantee Box */}
              <div className="mt-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <span>🌿</span> 100% Farm Fresh Guarantee
                </div>
                <p className="text-emerald-700">
                  Harvested freshly by local farmers. No middlemen, directly from farm to doorstep.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}