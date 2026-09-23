"use client";

import Link from "next/link";
import * as navigation from "next/navigation";

export default function OrderSuccess() {

  const searchParams =
    navigation.useSearchParams();

  const orderId =
    searchParams.get("orderId");


  return (

    <main className="order-success-page">

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

          <Link href="/login">
            Login
          </Link>

        </nav>

      </header>


      <section className="success-container">

        <div className="success-icon">
          ✓
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

export default function OrderSuccess() {
  return (
    <Suspense fallback={<main className="order-success-page" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}