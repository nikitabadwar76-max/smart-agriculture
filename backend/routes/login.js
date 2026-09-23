const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// =====================================================
// LOGIN
// POST /api/login
// Farmer OR Customer
// Mobile + Password
// =====================================================

router.post("/", async (req, res) => {
    try {
        const mobile = String(req.body.mobile || "").trim();
        const password = String(req.body.password || "");
        const role = String(req.body.role || "customer");
        const email = String(req.body.email || "").trim();

        console.log("=================================");
        console.log("🔐 LOGIN REQUEST");
        console.log("Mobile:", mobile);
        console.log("Password received:", password ? "YES" : "NO");
        console.log("=================================");

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Mobile number and password are required"
            });
        }

        // =================================================
        // CHECK FARMER
        // =================================================

        const [farmers] = await db.query(
            `SELECT
                farmer_id,
                farmer_name,
                email,
                mobile,
                password,
                location,
                address,
                status
             FROM farmers
             WHERE mobile = ?
             LIMIT 1`,
            [mobile]
        );

        console.log("👨‍🌾 Farmers found:", farmers.length);

        // =================================================
        // FARMER FOUND
        // =================================================

        if (farmers.length > 0) {
            const farmer = farmers[0];

            console.log("👨‍🌾 Farmer:", farmer.farmer_name);
            console.log("📱 DB Mobile:", farmer.mobile);
            console.log("🔑 Hash exists:", !!farmer.password);
            console.log(
                "🔑 Hash starts with $2b$:",
                farmer.password?.startsWith("$2b$")
            );

            // Check status
            if (
                farmer.status &&
                farmer.status.toLowerCase() !== "active"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Farmer account is not active"
                });
            }

            // ---------------------------------------------
            // PASSWORD CHECK
            // ---------------------------------------------

            const passwordMatch = await bcrypt.compare(
                password,
                farmer.password
            );

            console.log(
                "🔐 Password match:",
                passwordMatch
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid mobile number or password"
                });
            }

            console.log(
                "✅ FARMER LOGIN SUCCESS:",
                farmer.farmer_name
            );

            return res.status(200).json({
                success: true,
                message: "Farmer login successful",
                userType: "farmer",
                farmer: {
                    farmer_id: farmer.farmer_id,
                    farmer_name: farmer.farmer_name,
                    email: farmer.email,
                    mobile: farmer.mobile,
                    location: farmer.location,
                    address: farmer.address
                }
            });
        }

        // =================================================
        // CHECK CUSTOMER
        // =================================================

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

        console.log(
            "👤 Customers found:",
            customers.length
        );

        // =================================================
        // CUSTOMER NOT FOUND
        // =================================================

        if (customers.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password"
            });
        }

        const customer = customers[0];

        // ---------------------------------------------
        // CUSTOMER PASSWORD
        // ---------------------------------------------

        const customerPasswordMatch =
            await bcrypt.compare(
                password,
                customer.password
            );

        if (!customerPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password"
            });
        }

        console.log(
            "✅ CUSTOMER LOGIN SUCCESS:",
            customer.customer_name
        );

        return res.status(200).json({
            success: true,
            message: "Customer login successful",
            userType: "customer",
            customer: {
                customer_id: customer.customer_id,
                customer_name: customer.customer_name,
                mobile: customer.mobile
            }
        });

    } catch (error) {

        console.error("❌ LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Database error during login",
            error: error.message
        });
    }
});

module.exports = router;