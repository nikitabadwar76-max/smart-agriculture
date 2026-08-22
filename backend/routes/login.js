const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const db = require("../db");

// =====================================================
// CUSTOMER LOGIN
// POST /api/login
// =====================================================

router.post("/", async (req, res) => {
    const {
        phone,
        password
    } = req.body;

    // Validation
    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Mobile number and password are required"
        });
    }

    try {
        // Find customer
        const [customers] = await db.promise().query(
            `SELECT
                customer_id,
                customer_name,
                mobile,
                password
             FROM customers
             WHERE mobile = ?
             LIMIT 1`,
            [phone]
        );

        if (customers.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password"
            });
        }

        const customer = customers[0];

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            customer.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password"
            });
        }

        return res.json({
            success: true,
            message: "Login successful",
            customer: {
                customer_id: customer.customer_id,
                customer_name: customer.customer_name,
                mobile: customer.mobile
            }
        });

    } catch (error) {
        console.error("❌ Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
});

module.exports = router;