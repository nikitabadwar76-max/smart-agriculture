const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const db = require("../db");

// =====================================================
// FARMER REGISTER
// POST /api/farmers/register
// =====================================================

router.post("/register", async (req, res) => {
    const {
        farmer_name,
        email,
        password,
        mobile,
        location,
        address
    } = req.body;

    // Validation
    if (!farmer_name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Farmer name, email and password are required"
        });
    }

    try {
        // Check existing email
        const [existing] = await db.query(
            "SELECT farmer_id FROM farmers WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert farmer
        const [result] = await db.query(
            `INSERT INTO farmers
            (
                farmer_name,
                email,
                password,
                mobile,
                location,
                address
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                farmer_name,
                email,
                hashedPassword,
                mobile || null,
                location || null,
                address || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Farmer registered successfully",
            farmer_id: result.insertId
        });

    } catch (error) {
        console.error("❌ Farmer registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// =====================================================
// FARMER LOGIN
// POST /api/farmers/login
// =====================================================

router.post("/login", async (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        const [results] = await db.query(
            `SELECT
                farmer_id,
                farmer_name,
                email,
                password,
                mobile,
                location,
                address,
                status
             FROM farmers
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const farmer = results[0];

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            farmer.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check account status
        if (farmer.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Farmer account is inactive"
            });
        }

        return res.json({
            success: true,
            message: "Farmer login successful",
            farmer: {
                farmer_id: farmer.farmer_id,
                farmer_name: farmer.farmer_name,
                email: farmer.email,
                mobile: farmer.mobile,
                location: farmer.location,
                address: farmer.address
            }
        });

    } catch (error) {
        console.error("❌ Farmer login error:", error);

        return res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// =====================================================
// GET FARMER PROFILE
// GET /api/farmers/:id
// =====================================================

router.get("/:id", async (req, res) => {
    const farmerId = req.params.id;

    try {
        const [results] = await db.query(
            `SELECT
                farmer_id,
                farmer_name,
                email,
                mobile,
                location,
                address,
                profile_image,
                status,
                created_at
             FROM farmers
             WHERE farmer_id = ?`,
            [farmerId]
        );

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found"
            });
        }

        return res.json({
            success: true,
            farmer: results[0]
        });

    } catch (error) {
        console.error("❌ Get farmer error:", error);

        return res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});

module.exports = router;