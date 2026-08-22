const express = require("express");

const router = express.Router();
const db = require("../db");

// =====================================================
// ADD PRODUCT
// POST /api/products
// =====================================================

router.post("/", async (req, res) => {
    try {
        const {
            farmer_id,
            product_name,
            category,
            description,
            price,
            unit,
            stock,
            image_url
        } = req.body;

        if (
            !farmer_id ||
            !product_name ||
            !category ||
            price === undefined ||
            !unit ||
            stock === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        if (Number(price) < 0 || Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price and stock cannot be negative"
            });
        }

        const sql = `
            INSERT INTO products
            (
                farmer_id,
                product_name,
                category,
                description,
                price,
                unit,
                stock,
                image_url
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.promise().query(sql, [
            farmer_id,
            product_name,
            category,
            description || null,
            price,
            unit,
            stock,
            image_url || null
        ]);

        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product_id: result.insertId
        });

    } catch (error) {
        console.error("❌ Add product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product"
        });
    }
});


// =====================================================
// GET ALL AVAILABLE PRODUCTS
// GET /api/products
// =====================================================

router.get("/", async (req, res) => {
    try {
        const [products] = await db.promise().query(
            `SELECT
                product_id,
                farmer_id,
                product_name,
                category,
                description,
                price,
                unit,
                stock,
                image_url,
                status,
                created_at,
                updated_at
             FROM products
             WHERE status = 'available'
             AND stock > 0
             ORDER BY created_at DESC`
        );

        return res.json({
            success: true,
            products
        });

    } catch (error) {
        console.error("❌ Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get products"
        });
    }
});


// =====================================================
// GET PRODUCTS OF ONE FARMER
// GET /api/products/farmer/:farmerId
// =====================================================

router.get("/farmer/:farmerId", async (req, res) => {
    try {
        const { farmerId } = req.params;

        const [products] = await db.promise().query(
            `SELECT
                product_id,
                farmer_id,
                product_name,
                category,
                description,
                price,
                unit,
                stock,
                image_url,
                status,
                created_at,
                updated_at
             FROM products
             WHERE farmer_id = ?
             ORDER BY created_at DESC`,
            [farmerId]
        );

        return res.json({
            success: true,
            products
        });

    } catch (error) {
        console.error("❌ Farmer products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get farmer products"
        });
    }
});


// =====================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// =====================================================

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.promise().query(
            `SELECT
                product_id,
                farmer_id,
                product_name,
                category,
                description,
                price,
                unit,
                stock,
                image_url,
                status,
                created_at,
                updated_at
             FROM products
             WHERE product_id = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            product: products[0]
        });

    } catch (error) {
        console.error("❌ Get single product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get product"
        });
    }
});


// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            product_name,
            category,
            description,
            price,
            unit,
            stock,
            image_url,
            status
        } = req.body;

        if (
            !product_name ||
            !category ||
            price === undefined ||
            !unit ||
            stock === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        if (Number(price) < 0 || Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price and stock cannot be negative"
            });
        }

        const [result] = await db.promise().query(
            `UPDATE products
             SET
                product_name = ?,
                category = ?,
                description = ?,
                price = ?,
                unit = ?,
                stock = ?,
                image_url = ?,
                status = ?
             WHERE product_id = ?`,
            [
                product_name,
                category,
                description || null,
                price,
                unit,
                stock,
                image_url || null,
                status || "available",
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("❌ Update product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
});


// =====================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// =====================================================

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.promise().query(
            `DELETE FROM products
             WHERE product_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("❌ Delete product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product"
        });
    }
});

module.exports = router;