const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// Customer Registration
router.post("/register", async (req, res) => {
    try {
        const {
            customer_name,
            mobile,
            password
        } = req.body;

        // Validate input
        if (!customer_name || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, mobile number and password are required"
            });
        }

        // Check whether mobile already exists
        const [existingCustomers] = await db.query(
            `SELECT customer_id
             FROM customers
             WHERE mobile = ?
             LIMIT 1`,
            [mobile]
        );

        if (existingCustomers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Mobile number is already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert customer
        const [result] = await db.query(
            `INSERT INTO customers
                (customer_name, mobile, password)
             VALUES (?, ?, ?)`,
            [
                customer_name,
                mobile,
                hashedPassword
            ]
        );

        console.log(
            `Customer registered: ${result.insertId}`
        );

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                customer_id: result.insertId,
                customer_name,
                mobile
            }
        });

    } catch (error) {
        console.error(
            "Customer Registration Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
});

// =====================================================
// GET ALL CUSTOMERS (ADMIN)
// GET /api/customers
// =====================================================
router.get("/", async (req, res) => {
    try {
        const [customers] = await db.query(
            `SELECT
                customer_id,
                customer_name,
                mobile,
                address,
                created_at
             FROM customers
             ORDER BY customer_id DESC`
        );

        return res.json({
            success: true,
            customers
        });
    } catch (error) {
        console.error("❌ Get customers error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch customers",
            error: error.message
        });
    }
});

// =====================================================
// DELETE CUSTOMER (ADMIN)
// DELETE /api/customers/:id
// =====================================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query(
            "DELETE FROM customers WHERE customer_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.json({
            success: true,
            message: "Customer deleted successfully"
        });
    } catch (error) {
        console.error("❌ Delete customer error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete customer",
            error: error.message
        });
    }
});

module.exports = router;