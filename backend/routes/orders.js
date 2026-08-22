const express = require("express");

const router = express.Router();
const db = require("../db");

// =====================================================
// PLACE NEW ORDER
// POST /api/orders
// =====================================================

router.post("/", async (req, res) => {
    const {
        customer_id,
        total_amount,
        payment_method,
        delivery_address,
        items
    } = req.body;

    if (
        !customer_id ||
        total_amount === undefined ||
        !delivery_address ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Required order information is missing"
        });
    }

    const connection = await db.promise().getConnection();

    try {
        // Start transaction
        await connection.beginTransaction();

        // Insert order
        const [orderResult] = await connection.query(
            `INSERT INTO orders
            (
                customer_id,
                total_amount,
                payment_method,
                delivery_address
            )
            VALUES (?, ?, ?, ?)`,
            [
                customer_id,
                total_amount,
                payment_method || "Cash on Delivery",
                delivery_address
            ]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of items) {
            const productId = Number(item.product_id);
            const farmerId = Number(item.farmer_id) || 0;
            const quantity = Number(item.quantity);
            const price = Number(item.price);

            if (
                !productId ||
                !quantity ||
                quantity <= 0 ||
                price < 0
            ) {
                throw new Error("Invalid order item");
            }

            const subtotal = price * quantity;

            await connection.query(
                `INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    farmer_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    orderId,
                    productId,
                    farmerId,
                    quantity,
                    price,
                    subtotal
                ]
            );
        }

        // Commit transaction
        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order_id: orderId
        });

    } catch (error) {
        // Rollback if anything fails
        await connection.rollback();

        console.error("❌ Place order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to place order"
        });

    } finally {
        connection.release();
    }
});


// =====================================================
// GET CUSTOMER ORDERS
// GET /api/orders/customer/:customerId
// =====================================================

router.get("/customer/:customerId", async (req, res) => {
    const { customerId } = req.params;

    try {
        const [orders] = await db.promise().query(
            `SELECT *
             FROM orders
             WHERE customer_id = ?
             ORDER BY order_date DESC`,
            [customerId]
        );

        return res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("❌ Get customer orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get customer orders"
        });
    }
});


// =====================================================
// GET SINGLE ORDER
// GET /api/orders/:orderId
// =====================================================

router.get("/:orderId", async (req, res) => {
    const { orderId } = req.params;

    try {
        const [orders] = await db.promise().query(
            `SELECT *
             FROM orders
             WHERE order_id = ?`,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const [items] = await db.promise().query(
            `SELECT *
             FROM order_items
             WHERE order_id = ?`,
            [orderId]
        );

        return res.json({
            success: true,
            order: orders[0],
            items
        });

    } catch (error) {
        console.error("❌ Get order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get order"
        });
    }
});


// =====================================================
// GET FARMER ORDERS
// GET /api/orders/farmer/:farmerId
// =====================================================

router.get("/farmer/:farmerId", async (req, res) => {
    const { farmerId } = req.params;

    try {
        const [orders] = await db.promise().query(
            `SELECT
                o.order_id,
                o.customer_id,
                o.total_amount,
                o.order_status,
                o.payment_status,
                o.payment_method,
                o.delivery_address,
                o.order_date,
                oi.product_id,
                oi.quantity,
                oi.price,
                oi.subtotal
             FROM orders o
             INNER JOIN order_items oi
                ON o.order_id = oi.order_id
             WHERE oi.farmer_id = ?
             ORDER BY o.order_date DESC`,
            [farmerId]
        );

        return res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("❌ Get farmer orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get farmer orders"
        });
    }
});


// =====================================================
// UPDATE ORDER STATUS
// PUT /api/orders/:orderId/status
// =====================================================

router.put("/:orderId/status", async (req, res) => {
    const { orderId } = req.params;
    const { order_status } = req.body;

    if (!order_status) {
        return res.status(400).json({
            success: false,
            message: "Order status is required"
        });
    }

    try {
        const [result] = await db.promise().query(
            `UPDATE orders
             SET order_status = ?
             WHERE order_id = ?`,
            [
                order_status,
                orderId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.json({
            success: true,
            message: "Order status updated successfully"
        });

    } catch (error) {
        console.error("❌ Update order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update order status"
        });
    }
});

module.exports = router;