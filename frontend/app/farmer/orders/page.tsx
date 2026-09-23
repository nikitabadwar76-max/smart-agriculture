"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface OrderProduct {
  name: string;
  quantity: string;
  price: number;
  image?: string;
}

interface FarmerOrder {
  id: string;
  rawOrderId?: number;
  customer_name?: string;
  customer_mobile?: string;
  customer_address?: string;
  date: string;
  status: "Pending" | "Accepted" | "In Progress" | "Completed" | "Delivered" | "Cancelled";
  payment: string;
  items: string;
  delivery: string;
  total: number;
  products: OrderProduct[];
}

const DEFAULT_ORDERS: FarmerOrder[] = [
  {
    id: "ORD1003",
    customer_name: "Rahul Sharma",
    customer_mobile: "9876543210",
    customer_address: "Plot 14, Green Park, Kopargaon",
    date: "22 Aug 2026 • 10:30 AM",
    status: "Completed",
    payment: "Cash on Delivery",
    items: "3 Products",
    delivery: "Delivered",
    total: 305,
    products: [
      {
        name: "Fresh Tomatoes",
        quantity: "2 kg × ₹40",
        price: 80,
        image: "https://images.unsplash.com/photo-1546470427-e5ac89cd0b9d?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Fresh Potatoes",
        quantity: "3 kg × ₹35",
        price: 105,
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Fresh Vegetables",
        quantity: "2 kg × ₹60",
        price: 120,
        image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
  {
    id: "ORD1002",
    customer_name: "Pooja Patil",
    customer_mobile: "9123456780",
    customer_address: "Near Temple, Station Road, Kopargaon",
    date: "20 Aug 2026 • 03:45 PM",
    status: "Accepted",
    payment: "Cash on Delivery",
    items: "2 Products",
    delivery: "In Progress",
    total: 160,
    products: [
      {
        name: "Organic Tomatoes",
        quantity: "2 kg × ₹45",
        price: 90,
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Fresh Onions",
        quantity: "2 kg × ₹35",
        price: 70,
        image: "https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
  {
    id: "ORD1001",
    customer_name: "Amit Deshmukh",
    customer_mobile: "9988776655",
    customer_address: "Shivaji Nagar, Kopargaon",
    date: "18 Aug 2026 • 12:20 PM",
    status: "Pending",
    payment: "Cash on Delivery",
    items: "1 Product",
    delivery: "Processing",
    total: 175,
    products: [
      {
        name: "Fresh Potatoes",
        quantity: "5 kg × ₹35",
        price: 175,
        image: "https://images.unsplash.com/photo-1518977956812-cd3db6f2f3a3?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
];

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<FarmerOrder[]>(DEFAULT_ORDERS);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [farmerName, setFarmerName] = useState<string>("Farmer");

  const fetchFarmerOrders = async () => {
    try {
      setLoading(true);
      const farmerId = localStorage.getItem("farmer_id") || "1";
      const storedName = localStorage.getItem("farmer_name");
      if (storedName) setFarmerName(storedName);

      const response = await fetch(`http://localhost:5000/api/orders/farmer/${farmerId}`);
      if (!response.ok) return;

      const data = await response.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        // Group raw DB rows by order_id
        const orderMap = new Map<number, FarmerOrder>();

        data.orders.forEach((row: any) => {
          if (!orderMap.has(row.order_id)) {
            orderMap.set(row.order_id, {
              id: `ORD${row.order_id}`,
              rawOrderId: row.order_id,
              customer_name: row.customer_name || "Customer",
              customer_mobile: row.customer_mobile || "",
              customer_address: row.delivery_address || row.customer_address || "",
              date: row.order_date
                ? new Date(row.order_date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent",
              status: row.order_status || "Pending",
              payment: row.payment_method || "Cash on Delivery",
              items: "1 Product",
              delivery: row.order_status === "Completed" ? "Delivered" : "In Progress",
              total: Number(row.total_amount) || 0,
              products: [],
            });
          }

          const existing = orderMap.get(row.order_id)!;
          existing.products.push({
            name: row.product_name || "Farm Product",
            quantity: `${row.quantity} × ₹${row.price}`,
            price: Number(row.subtotal) || Number(row.price) * Number(row.quantity),
            image: "https://images.unsplash.com/photo-1546470427-e5ac89cd0b9d?auto=format&fit=crop&w=200&q=80",
          });
          existing.items = `${existing.products.length} Products`;
        });

        setOrders(Array.from(orderMap.values()));
      }
    } catch (err) {
      console.error("Error fetching farmer orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerOrders();
  }, []);

  const handleUpdateStatus = async (orderIdStr: string, rawId: number | undefined, newStatus: FarmerOrder["status"]) => {
    // Update locally for instant UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderIdStr ? { ...o, status: newStatus, delivery: newStatus === "Completed" ? "Delivered" : "In Progress" } : o))
    );

    if (rawId) {
      try {
        await fetch(`http://localhost:5000/api/orders/${rawId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_status: newStatus }),
        });
      } catch (err) {
        console.error("Failed to update status on server:", err);
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "accepted":
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* TOP NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl shadow-sm mb-8 border border-gray-100 gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/farmer/products"
              className="font-semibold text-gray-600 hover:text-green-700 px-4 py-2.5 rounded-2xl transition hover:bg-gray-50"
            >
              🌱 Manage Products
            </Link>
            <Link
              href="/farmer/orders"
              className="font-bold text-green-700 bg-green-50 px-5 py-2.5 rounded-2xl shadow-xs"
            >
              📦 Customer Orders
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3.5 py-1.5 rounded-full">
              👨‍🌾 {farmerName}
            </span>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="text-red-600 text-sm font-bold hover:underline cursor-pointer bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
              CUSTOMER ORDERS PANEL
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">
              Customer Orders
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage incoming customer orders, track payments, and update delivery status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-black text-sm px-4 py-2 rounded-2xl shadow-md">
              {filteredOrders.length} {filteredOrders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/60 w-fit">
          {["All", "Pending", "Accepted", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                filter === tab
                  ? "bg-green-700 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ORDERS GRID */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto mt-10">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800">No Orders Found</h3>
            <p className="text-gray-500 text-sm mt-1">
              There are no orders matching "{filter}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* CARD TOP HEADER */}
                <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-gray-50/70 to-white">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-black text-gray-800">
                          Order #{order.id}
                        </h2>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        🗓️ {order.date}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* CUSTOMER DETAILS IF AVAILABLE */}
                  {order.customer_name && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>👤 <strong className="text-gray-800">{order.customer_name}</strong></span>
                      {order.customer_mobile && <span>📱 {order.customer_mobile}</span>}
                      {order.customer_address && <span>📍 {order.customer_address}</span>}
                    </div>
                  )}
                </div>

                {/* 3 SUMMARY PILLS */}
                <div className="grid grid-cols-3 gap-3 p-6 pb-4">
                  <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100/80">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      PAYMENT
                    </span>
                    <strong className="text-xs sm:text-sm text-gray-800 mt-0.5 block font-bold">
                      {order.payment}
                    </strong>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100/80">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      ITEMS
                    </span>
                    <strong className="text-xs sm:text-sm text-gray-800 mt-0.5 block font-bold">
                      {order.items}
                    </strong>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100/80">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      DELIVERY
                    </span>
                    <strong className="text-xs sm:text-sm text-green-700 mt-0.5 block font-bold">
                      {order.delivery}
                    </strong>
                  </div>
                </div>

                {/* ORDER ITEMS LIST */}
                <div className="px-6 py-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Order Items
                  </h3>

                  <div className="space-y-3">
                    {order.products.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || "https://images.unsplash.com/photo-1546470427-e5ac89cd0b9d?auto=format&fit=crop&w=200&q=80"}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                          />
                          <div>
                            <strong className="text-sm font-bold text-gray-800 block">
                              {product.name}
                            </strong>
                            <span className="text-xs text-gray-500">
                              {product.quantity}
                            </span>
                          </div>
                        </div>

                        <span className="text-sm font-black text-gray-800">
                          ₹{product.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TOTAL + ACTIONS */}
                <div className="p-6 pt-4 mt-2">
                  <div className="flex justify-between items-center py-3 border-t border-b border-gray-100 mb-5">
                    <span className="text-sm font-semibold text-gray-600">
                      Total Amount
                    </span>
                    <strong className="text-2xl font-black text-green-700">
                      ₹{order.total}
                    </strong>
                  </div>

                  {/* ACTION BUTTONS FOR FARMER */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, order.rawOrderId, "Accepted")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-md shadow-green-600/20 cursor-pointer"
                      >
                        ✓ Accept Order
                      </button>
                    )}

                    {order.status === "Accepted" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, order.rawOrderId, "Completed")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        📦 Mark Delivered
                      </button>
                    )}

                    {order.status === "Completed" && (
                      <div className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl text-center text-sm font-bold border border-emerald-200">
                        ✅ Order Delivered & Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}