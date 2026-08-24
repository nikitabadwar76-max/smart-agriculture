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

        const [result] = await db.query(sql, [
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
        console.error("Add Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product",
            error: error.message
        });
    }
});


// =====================================================
// GET ALL AVAILABLE PRODUCTS
// GET /api/products
// =====================================================

router.get("/", async (req, res) => {
    try {
        console.log("GET /api/products called");

        const [products] = await db.query(`
            SELECT
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
            ORDER BY created_at DESC
        `);

        console.log("Products found:", products.length);

        return res.status(200).json({
            success: true,
            products: products
        });

    } catch (error) {
        console.error("=================================");
        console.error("GET PRODUCTS ERROR:");
        console.error(error);
        console.error("=================================");

        return res.status(500).json({
            success: false,
            message: "Failed to get products",
            error: error.message
        });
    }
});

// =====================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// =====================================================

router.get("/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        const [products] = await db.query(
            `
            SELECT
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
            WHERE product_id = ?
            LIMIT 1
            `,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product: products[0]
        });

    } catch (error) {
        console.error("Get Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get product",
            error: error.message
        });
    }
});


// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================

router.put("/:id", async (req, res) => {
    try {
        const productId = req.params.id;

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
                message: "Please provide all required fields"
            });
        }

        if (Number(price) < 0 || Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price and stock cannot be negative"
            });
        }

        const [result] = await db.query(
            `
            UPDATE products
            SET
                product_name = ?,
                category = ?,
                description = ?,
                price = ?,
                unit = ?,
                stock = ?,
                image_url = ?,
                status = ?
            WHERE product_id = ?
            `,
            [
                product_name,
                category,
                description || null,
                price,
                unit,
                stock,
                image_url || null,
                status || "available",
                productId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("Update Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message
        });
    }
});


// =====================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// =====================================================

router.delete("/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        const [result] = await db.query(
            `
            DELETE FROM products
            WHERE product_id = ?
            `,
            [productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
});


module.exports = router;