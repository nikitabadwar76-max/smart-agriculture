"use client";

import { useEffect, useState } from "react";

interface Order {
    order_id: number;
    customer_id: number;
    total_amount: number;
    order_status: string;
    payment_status: string;
    payment_method: string;
    delivery_address: string;
    order_date: string;
}

export default function CustomerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            // Change this later if your login stores the ID differently
            const customerId = localStorage.getItem("customer_id");

            if (!customerId) {
                alert("Customer login required");
                setLoading(false);
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/orders/customer/${customerId}`
            );

            const data = await response.json();

            if (data.success) {
                setOrders(data.orders);
            } else {
                alert(data.message || "Unable to load orders");
            }
        } catch (error) {
            console.error("Load orders error:", error);
            alert("Backend server is not available");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Loading orders...</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px" }}>
            <h1>My Orders</h1>

            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                orders.map((order) => (
                    <div
                        key={order.order_id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "20px",
                            marginTop: "20px",
                        }}
                    >
                        <h3>Order #{order.order_id}</h3>

                        <p>
                            <strong>Total:</strong> ₹
                            {Number(order.total_amount).toFixed(2)}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {order.order_status}
                        </p>

                        <p>
                            <strong>Payment:</strong>{" "}
                            {order.payment_method}
                        </p>

                        <p>
                            <strong>Payment Status:</strong>{" "}
                            {order.payment_status}
                        </p>

                        <p>
                            <strong>Delivery Address:</strong>{" "}
                            {order.delivery_address}
                        </p>

                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(order.order_date).toLocaleString()}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}