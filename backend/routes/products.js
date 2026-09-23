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
// =====================================================
// GET PRODUCTS (MARKETPLACE & ADMIN)
// GET /api/products (?all=true for admin view)
// =====================================================

router.get("/", async (req, res) => {
    try {
        const isAll = req.query.all === "true";

        let sql = `
            SELECT
                p.product_id,
                p.farmer_id,
                p.product_name,
                p.category,
                p.description,
                p.price,
                p.unit,
                p.stock,
                p.image_url,
                p.status,
                p.created_at,
                p.updated_at,
                f.farmer_name,
                f.mobile AS farmer_mobile
            FROM products p
            LEFT JOIN farmers f
                ON p.farmer_id = f.farmer_id
        `;

        if (!isAll) {
            sql += ` WHERE p.status = 'available' AND p.stock > 0 `;
        }

        sql += ` ORDER BY p.created_at DESC `;

        const [products] = await db.query(sql);

        return res.status(200).json({
            success: true,
            products: products
        });

    } catch (error) {
        console.error("=================================");
        console.error("GET PRODUCTS ERROR:", error);
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