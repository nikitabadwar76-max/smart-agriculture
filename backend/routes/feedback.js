const express = require("express");

const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// =====================================================
// ADD CUSTOMER FEEDBACK
// POST /api/feedback
// =====================================================

router.post("/", auth, async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;

        // Validate required fields
        if (!product_id || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product and rating are required"
            });
        }

        // Validate rating
        if (Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Check whether product exists
        const [products] = await db.query(
            `SELECT product_id FROM products WHERE product_id = ? LIMIT 1`,
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Insert feedback
        const [result] = await db.query(
            `
            INSERT INTO customer_feedback
            (customer_id, product_id, rating, comment)
            VALUES (?, ?, ?, ?)
            `,
            [
                req.user.id,
                product_id,
                rating,
                comment || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback_id: result.insertId
        });

    } catch (error) {
        console.error("Add Feedback Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
            error: error.message
        });
    }
});


// =====================================================
// GET PRODUCT FEEDBACK
// GET /api/feedback/product/:productId
// =====================================================

router.get("/product/:productId", async (req, res) => {
    try {
        const productId = req.params.productId;

        const [feedback] = await db.query(
            `
            SELECT
                cf.feedback_id,
                cf.rating,
                cf.comment,
                cf.created_at,
                c.customer_name
            FROM customer_feedback cf
            INNER JOIN customers c
                ON cf.customer_id = c.customer_id
            WHERE cf.product_id = ?
            ORDER BY cf.created_at DESC
            `,
            [productId]
        );

        return res.status(200).json({
            success: true,
            feedback
        });

    } catch (error) {
        console.error("Get Feedback Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get feedback",
            error: error.message
        });
    }
});


module.exports = router;