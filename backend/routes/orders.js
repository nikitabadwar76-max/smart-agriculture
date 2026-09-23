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

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

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

    let connection;

    try {
        // -------------------------------------------------
        // GET CONNECTION
        // IMPORTANT:
        // db is already mysql2/promise
        // DO NOT USE db.promise()
        // -------------------------------------------------

        connection = await db.getConnection();

        // -------------------------------------------------
        // START TRANSACTION
        // -------------------------------------------------

        await connection.beginTransaction();

        // -------------------------------------------------
        // CHECK CUSTOMER
        // -------------------------------------------------

        const [customers] = await connection.query(
            `SELECT customer_id
             FROM customers
             WHERE customer_id = ?`,
            [customer_id]
        );

        if (customers.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Customer not found"
            });
        }

        // -------------------------------------------------
        // INSERT ORDER
        // -------------------------------------------------

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
                Number(total_amount),
                payment_method || "Cash on Delivery",
                delivery_address
            ]
        );

        const orderId = orderResult.insertId;

        // -------------------------------------------------
        // INSERT ORDER ITEMS
        // -------------------------------------------------

        for (const item of items) {

            const productId = Number(item.product_id);
            const farmerId = Number(item.farmer_id);
            const quantity = Number(item.quantity);
            const price = Number(item.price);

            // Validate item
            if (
                !productId ||
                !quantity ||
                quantity <= 0 ||
                !Number.isFinite(price) ||
                price < 0
            ) {
                throw new Error("Invalid order item");
            }

            // If farmer_id is missing, get it from products table
            let finalFarmerId = farmerId;

            if (!finalFarmerId) {
                const [products] = await connection.query(
                    `SELECT farmer_id
                     FROM products
                     WHERE product_id = ?`,
                    [productId]
                );

                if (products.length === 0) {
                    throw new Error(
                        `Product ${productId} not found`
                    );
                }

                finalFarmerId = products[0].farmer_id;
            }

            const subtotal = price * quantity;

            // -------------------------------------------------
            // INSERT ORDER ITEM
            // -------------------------------------------------

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
                    finalFarmerId,
                    quantity,
                    price,
                    subtotal
                ]
            );
        }

        // -------------------------------------------------
        // COMMIT TRANSACTION
        // -------------------------------------------------

        await connection.commit();

        console.log(
            `✅ Order ${orderId} placed successfully`
        );

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order_id: orderId
        });

    } catch (error) {

        // -------------------------------------------------
        // ROLLBACK
        // -------------------------------------------------

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError.message
                );
            }
        }

        console.error(
            "❌ Place order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to place order"
        });

    } finally {

        // -------------------------------------------------
        // RELEASE CONNECTION
        // -------------------------------------------------

        if (connection) {
            connection.release();
        }
    }
});


// =====================================================
// GET CUSTOMER ORDERS
// GET /api/orders/customer/:customerId
// =====================================================

router.get("/customer/:customerId", async (req, res) => {

    const { customerId } = req.params;

    try {

        const [orders] = await db.query(
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

        console.error(
            "❌ Get customer orders error:",
            error
        );

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

    // Handle string IDs like FD00000022 or raw numeric IDs like 22
    const numericId = String(orderId).replace(/\D/g, "");
    const queryId = numericId ? Number(numericId) : orderId;

    try {

        const [orders] = await db.query(
            `SELECT 
                o.order_id,
                o.customer_id,
                c.customer_name,
                c.mobile AS customer_mobile,
                c.address AS customer_profile_address,
                o.total_amount,
                o.order_status,
                o.payment_status,
                o.payment_method,
                o.delivery_address,
                o.order_date,
                o.updated_at
             FROM orders o
             LEFT JOIN customers c
                ON o.customer_id = c.customer_id
             WHERE o.order_id = ?`,
            [queryId]
        );

        if (orders.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const [items] = await db.query(
            `SELECT 
                oi.order_item_id,
                oi.order_id,
                oi.product_id,
                oi.farmer_id,
                oi.quantity,
                oi.price,
                oi.subtotal,
                p.product_name,
                p.unit,
                p.image_url
             FROM order_items oi
             LEFT JOIN products p
                ON oi.product_id = p.product_id
             WHERE oi.order_id = ?`,
            [queryId]
        );

        return res.json({
            success: true,
            order: orders[0],
            items
        });

    } catch (error) {

        console.error(
            "❌ Get order error:",
            error
        );

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

        const [orders] = await db.query(
    `SELECT 
        o.order_id,
        o.customer_id,
        c.customer_name,
        c.mobile AS customer_mobile,
        c.address AS customer_address,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.delivery_address,
        o.order_date,
        oi.product_id,
        p.product_name,
        oi.quantity,
        oi.price,
        oi.subtotal
     FROM orders o
     INNER JOIN customers c
        ON o.customer_id = c.customer_id
     INNER JOIN order_items oi
        ON o.order_id = oi.order_id
     INNER JOIN products p
        ON oi.product_id = p.product_id
     WHERE oi.farmer_id = ?
     ORDER BY o.order_date DESC`,
    [farmerId]
);
        return res.json({
            success: true,
            orders
        });

    } catch (error) {

        console.error(
            "❌ Get farmer orders error:",
            error
        );

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

        const [result] = await db.query(
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

        console.error(
            "❌ Update order status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update order status"
        });
    }
});


// =====================================================
// EXPORT
// =====================================================

module.exports = router;