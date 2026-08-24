const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // Validate input
        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Mobile number and password are required"
            });
        }

        // Find customer
        const [customers] = await db.query(
            `SELECT
                customer_id,
                customer_name,
                mobile,
                password
             FROM customers
             WHERE mobile = ?
             LIMIT 1`,
            [mobile]
        );

        // Customer not found
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

        // Login successful
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
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
});

module.exports = router;