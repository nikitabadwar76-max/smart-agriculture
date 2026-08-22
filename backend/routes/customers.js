const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const db = require("../db");

// =====================================================
// CUSTOMER REGISTRATION
// POST /api/customers/register
// =====================================================

router.post("/register", async (req, res) => {
    const {
        name,
        phone,
        password,
        address
    } = req.body;

    // Validation
    if (!name || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, mobile number and password are required"
        });
    }

    try {
        // Check existing customer
        const [existing] = await db.promise().query(
            `SELECT customer_id
             FROM customers
             WHERE mobile = ?
             LIMIT 1`,
            [phone]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Mobile number is already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert customer
        const [result] = await db.promise().query(
            `INSERT INTO customers
            (
                customer_name,
                mobile,
                password,
                address
            )
            VALUES (?, ?, ?, ?)`,
            [
                name,
                phone,
                hashedPassword,
                address || null
            ]
        );

        console.log(`✅ Customer registered: ${result.insertId}`);

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                customer_id: result.insertId,
                customer_name: name,
                mobile: phone
            }
        });

    } catch (error) {
        console.error("❌ Customer registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to register customer"
        });
    }
});

module.exports = router;