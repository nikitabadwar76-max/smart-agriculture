"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  farmer_id: number;
  quantity: number;
  price: string | number;
  subtotal: string | number;
  product_name?: string;
  unit?: string;
  image_url?: string | null;
}

interface OrderDetails {
  order_id: number;
  customer_id: number;
  customer_name?: string;
  customer_mobile?: string;
  customer_profile_address?: string;
  total_amount: string | number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  delivery_address: string;
  order_date: string;
  updated_at?: string;
}

function normalizePhoneNumber(rawPhone?: string | null): string | null {
  if (!rawPhone) return null;
  // Strip all non-digit characters
  let digits = rawPhone.replace(/\D/g, "");

  // Remove leading 0 if 11 digits (common in Indian landline/mobile dial format)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  // If 10 digits, prepend India country code 91
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // If 12 digits starting with 91, it's already well-formatted
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  // If it has at least 10 digits and seems valid, return digits
  if (digits.length >= 10) {
    return digits;
  }

  return null;
}

function formatOrderId(id: number | string): string {
  const numericId = String(id).replace(/\D/g, "");
  if (!numericId) return String(id);
  return `FD${numericId.padStart(8, "0")}`;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryOrderId = searchParams.get("orderId");
  const [orderId, setOrderId] = useState<string | null>(queryOrderId);

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [whatsAppNotice, setWhatsAppNotice] = useState<string | null>(null);
  const [isProcessingWhatsApp, setIsProcessingWhatsApp] = useState<boolean>(false);

  // Determine effective order ID
  useEffect(() => {
    if (queryOrderId) {
      setOrderId(queryOrderId);
    } else {
      const storedLastOrderId = localStorage.getItem("last_order_id");
      if (storedLastOrderId) {
        setOrderId(storedLastOrderId);
      } else {
        setLoading(false);
      }
    }
  }, [queryOrderId]);

  // Fetch actual order data from backend
  const fetchOrder = async (idToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${idToFetch}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found in the database.");
        }
        throw new Error("Unable to retrieve order details. Please check connection.");
      }

      const data = await response.json();
      if (!data.success || !data.order) {
        throw new Error(data.message || "Order information could not be loaded.");
      }

      setOrder(data.order);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err: any) {
      console.error("❌ Order Success Fetch Error:", err);
      setError(err?.message || "Failed to load order confirmation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  // WhatsApp receipt generator & sender
  const handleSendWhatsAppReceipt = () => {
    if (isProcessingWhatsApp) return;
    setWhatsAppNotice(null);

    if (!order) {
      setWhatsAppNotice("Order details are still loading. Please wait a moment.");
      return;
    }

    // Attempt to get customer mobile:
    // 1. From backend order query (joined from customers table)
    // 2. From localStorage "customer_mobile"
    const rawMobile =
      order.customer_mobile ||
      localStorage.getItem("customer_mobile") ||
      localStorage.getItem("customerMobile");

    const normalizedPhone = normalizePhoneNumber(rawMobile);

    if (!normalizedPhone) {
      setWhatsAppNotice(
        "Mobile number is not available. Please update your profile to send the receipt on WhatsApp."
      );
      return;
    }

    setIsProcessingWhatsApp(true);

    try {
      const displayOrderId = formatOrderId(order.order_id);
      const customerName =
        order.customer_name ||
        localStorage.getItem("customer_name") ||
        localStorage.getItem("customerName") ||
        "Customer";
      const formattedDateStr = formatDate(order.order_date) || "Today";
      const deliveryAddress =
        order.delivery_address ||
        order.customer_profile_address ||
        "Delivery Address";
      const grandTotal = Number(order.total_amount).toFixed(0);

      // Build product items list
      const itemsList = items.map((item, index) => {
        const pName = item.product_name || `Product #${item.product_id}`;
        const qty = item.unit
          ? `${item.quantity} ${item.unit}`
          : `${item.quantity}`;
        const itemPrice = Number(
          item.subtotal || Number(item.price) * Number(item.quantity)
        ).toFixed(0);

        return `${index + 1}. ${pName}\n   Quantity: ${qty}\n   Price: ₹${itemPrice}`;
      });

      const messageParts: string[] = [
        "🌱 *SmartAgri — Order Receipt*",
        "",
        "✅ *Order Confirmed*",
        "",
        `*Order ID:* ${displayOrderId}`,
        `*Customer:* ${customerName}`,
        `*Date:* ${formattedDateStr}`,
        "",
        "━━━━━━━━━━━━━━",
        "🛒 *Order Details*",
        "━━━━━━━━━━━━━━",
        "",
        itemsList.length > 0
          ? itemsList.join("\n\n")
          : "1. Fresh Farm Products\n   Quantity: 1\n   Price: ₹" + grandTotal,
        "",
        "━━━━━━━━━━━━━━",
        `💰 *Total: ₹${grandTotal}*`,
        "━━━━━━━━━━━━━━",
        "",
        "📍 *Delivery Address:*",
        deliveryAddress,
        "",
        "🚜 Your order has been received.",
        "The farmer will prepare your products and update the order status.",
        "",
        "Thank you for shopping with SmartAgri! 🌱",
      ];

      const fullMessage = messageParts.join("\n");
      const encodedMessage = encodeURIComponent(fullMessage);
      const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;

      // Open WhatsApp in new window/tab
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (sendErr) {
      console.error("WhatsApp generation error:", sendErr);
      setWhatsAppNotice("Could not generate WhatsApp link. Please try again.");
    } finally {
      // Small timeout to reset click debounce
      setTimeout(() => {
        setIsProcessingWhatsApp(false);
      }, 1200);
    }
  };

  // -------------------------------------------------------------
  // RENDER: MISSING ORDER ID
  // -------------------------------------------------------------
  if (!orderId && !loading) {
    return (
      <main className="min-h-screen bg-[#f7faf5] text-[#17251b]">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-emerald-100">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              📦
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              No Order Specified
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn’t find an active order ID to display. If you recently placed an order, you can check your orders list or visit the marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition"
              >
                🛍 Continue Shopping
              </Link>
              <Link
                href="/farmer/orders"
                className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
              >
                📄 View Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // RENDER: LOADING SKELETON
  // -------------------------------------------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7faf5] text-[#17251b]">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-emerald-100 animate-pulse text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto mb-8"></div>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="h-16 bg-gray-100 rounded-2xl"></div>
              <div className="h-28 bg-gray-100 rounded-2xl"></div>
              <div className="h-14 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // RENDER: ERROR STATE
  // -------------------------------------------------------------
  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#f7faf5] text-[#17251b]">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-red-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ⚠️
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Unable to Load Order
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error || "Something went wrong while loading your order confirmation."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {orderId && (
                <button
                  onClick={() => fetchOrder(orderId)}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                >
                  🔄 Try Again
                </button>
              )}
              <Link
                href="/marketplace"
                className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
              >
                🛍 Back to Marketplace
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // CALCULATIONS & VALUES
  // -------------------------------------------------------------
  const displayOrderId = formatOrderId(order.order_id);
  const customerName =
    order.customer_name ||
    localStorage.getItem("customer_name") ||
    localStorage.getItem("customerName") ||
    "Customer";
  const formattedDate = formatDate(order.order_date);
  const formattedDateTime = formatDateTime(order.order_date);
  const totalAmount = Number(order.total_amount);

  // Subtotal from items
  const itemsSubtotal = items.reduce(
    (acc, it) => acc + Number(it.subtotal || Number(it.price) * Number(it.quantity)),
    0
  );
  const deliveryCharge = totalAmount > itemsSubtotal ? totalAmount - itemsSubtotal : 0;

  return (
    <main className="min-h-screen bg-[#f7faf5] text-[#17251b] pb-16">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* =========================================================
            SUCCESS HERO CARD
        ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-emerald-100 text-center mb-8 relative overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Green Success / Check Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center text-4xl sm:text-5xl shadow-lg shadow-emerald-500/25 ring-8 ring-emerald-50">
            ✓
          </div>

          <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase mb-3">
            Order Confirmed!
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
            Thank you for your order 🎉
          </h1>

          <p className="text-gray-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-6">
            Your order has been successfully placed. The farmer has received your details and will prepare your fresh produce.
          </p>

          {/* Actual Order ID & Status Banner */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 mx-auto">
            <div>
              <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Order ID
              </span>
              <strong className="text-lg sm:text-xl font-mono font-bold text-gray-800">
                {displayOrderId}
              </strong>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            <div>
              <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Order Status
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-100/70 px-3 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {order.order_status || "Pending"}
              </span>
            </div>

            {formattedDate && (
              <>
                <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                <div>
                  <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Order Date
                  </span>
                  <strong className="text-sm sm:text-base font-semibold text-gray-700">
                    {formattedDate}
                  </strong>
                </div>
              </>
            )}
          </div>
        </div>

        {/* =========================================================
            WHATSAPP RECEIPT NOTICE / BANNER
        ========================================================= */}
        {whatsAppNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm sm:text-base flex items-start gap-3 shadow-sm animate-fadeIn">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold">{whatsAppNotice}</p>
            </div>
            <button
              onClick={() => setWhatsAppNotice(null)}
              className="text-amber-500 hover:text-amber-700 font-bold ml-2 cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================
            ORDER DETAILS CARD (PRODUCTS & TOTALS)
        ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>🛒</span> Ordered Products
            </h2>
            <span className="text-sm font-semibold text-gray-500">
              {items.length} {items.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          {/* Product Items List */}
          <div className="divide-y divide-gray-100">
            {items.length > 0 ? (
              items.map((item) => {
                const itemTotal = Number(
                  item.subtotal || Number(item.price) * Number(item.quantity)
                ).toFixed(2);
                return (
                  <div
                    key={item.order_item_id}
                    className="py-4 flex items-center gap-4 justify-between"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden text-2xl">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "🌱"
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 text-base truncate">
                          {item.product_name || `Product #${item.product_id}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Qty:{" "}
                          <span className="font-semibold text-gray-700">
                            {item.quantity} {item.unit || ""}
                          </span>
                          {" • "}
                          ₹{Number(item.price).toFixed(2)}
                          {item.unit ? ` / ${item.unit}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-gray-900 text-base">
                        ₹{itemTotal}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-gray-500">
                Produce package included in order.
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-gray-100 pt-5 mt-4 space-y-2.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">
                ₹{(itemsSubtotal > 0 ? itemsSubtotal : totalAmount).toFixed(2)}
              </span>
            </div>

            {deliveryCharge > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Charge</span>
                <span className="font-semibold">
                  ₹{deliveryCharge.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm text-gray-600">
              <span>Payment Method</span>
              <span className="font-semibold">
                {order.payment_method || "Cash on Delivery"}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-800">
                Total Amount
              </span>
              <span className="text-2xl font-extrabold text-emerald-600">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            CUSTOMER & DELIVERY INFO CARDS
        ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Customer Profile Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <span>👤</span> Customer Information
            </h3>
            <p className="text-lg font-bold text-gray-800 mb-1">
              {customerName}
            </p>
            {order.customer_mobile && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <span>📱</span> {order.customer_mobile}
              </p>
            )}
            {formattedDateTime && (
              <p className="text-xs text-gray-400 mt-2">
                Placed on: {formattedDateTime}
              </p>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <span>📍</span> Delivery Address
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-medium">
              {order.delivery_address ||
                order.customer_profile_address ||
                "No delivery address provided."}
            </p>
          </div>
        </div>

        {/* =========================================================
            ACTION BUTTONS: WHATSAPP + DETAILS + NAVIGATION
        ========================================================= */}
        <div className="space-y-4">
          {/* Primary WhatsApp Receipt Button */}
          <button
            type="button"
            onClick={handleSendWhatsAppReceipt}
            disabled={isProcessingWhatsApp}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg text-white shadow-lg transition-all duration-200 transform active:scale-[0.99] disabled:opacity-75 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              boxShadow: "0 10px 25px rgba(37, 211, 102, 0.35)",
            }}
          >
            <span className="text-2xl leading-none">📱</span>
            <span>
              {isProcessingWhatsApp
                ? "Opening WhatsApp..."
                : "Send Receipt on WhatsApp"}
            </span>
          </button>

          {/* Secondary Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              href={`/order-details?orderId=${order.order_id}`}
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-semibold rounded-2xl shadow-sm transition"
            >
              <span>📄</span> View Order Details
            </Link>

            <Link
              href="/marketplace"
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-sm transition"
            >
              <span>🛍</span> Continue Shopping
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-2xl shadow-sm transition"
            >
              <span>🏠</span> Go to Home
            </Link>
          </div>
        </div>

        {/* Friendly footer hint */}
        <p className="text-center text-xs text-gray-400 mt-8">
          🌱 SmartAgri — Fresh produce direct from local farmers to your table.
        </p>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight flex items-center gap-2"
        >
          <span>🌱</span> SmartAgri
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-gray-600">
          <Link
            href="/marketplace"
            className="hover:text-emerald-600 transition"
          >
            Marketplace
          </Link>
          <Link
            href="/farmer/orders"
            className="hover:text-emerald-600 transition"
          >
            Orders
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
          >
            Account
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7faf5] flex items-center justify-center text-emerald-700 font-bold">
          Loading order confirmation...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}