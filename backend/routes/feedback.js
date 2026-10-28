const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// =====================================================
// GET FEEDBACK FOR A PRODUCT
// GET /api/feedback/product/:productId
// =====================================================
router.get("/product/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!productId || Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check if product exists
    const [products] = await db.query(
      "SELECT product_id, product_name FROM products WHERE product_id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Fetch all reviews for this product
    const [feedbackRows] = await db.query(
      `SELECT 
        fb.feedback_id,
        fb.product_id,
        fb.customer_id,
        fb.order_id,
        fb.rating,
        fb.comment,
        fb.created_at,
        fb.updated_at,
        c.customer_name,
        CASE WHEN fb.order_id IS NOT NULL THEN 1 ELSE 0 END AS verified_purchase
      FROM product_feedback fb
      LEFT JOIN customers c ON fb.customer_id = c.customer_id
      WHERE fb.product_id = ?
      ORDER BY fb.created_at DESC`,
      [productId]
    );

    // Calculate rating distribution & average
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;

    feedbackRows.forEach((row) => {
      const r = Number(row.rating);
      if (distribution[r] !== undefined) {
        distribution[r]++;
      }
      totalScore += r;
    });

    const totalReviews = feedbackRows.length;
    const averageRating =
      totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      product: products[0],
      stats: {
        average_rating: averageRating,
        total_reviews: totalReviews,
        distribution,
      },
      feedback: feedbackRows,
    });
  } catch (error) {
    console.error("Get Product Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
});

// =====================================================
// CHECK IF CURRENT USER REVIEWED PRODUCT
// GET /api/feedback/check/:productId
// =====================================================
router.get("/check/:productId", auth, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const customerId = req.user.id;

    if (req.user.role !== "customer") {
      return res.json({
        success: true,
        reviewed: false,
      });
    }

    const [rows] = await db.query(
      `SELECT feedback_id, product_id, customer_id, order_id, rating, comment, created_at, updated_at
       FROM product_feedback
       WHERE product_id = ? AND customer_id = ?
       LIMIT 1`,
      [productId, customerId]
    );

    if (rows.length > 0) {
      return res.json({
        success: true,
        reviewed: true,
        feedback: rows[0],
      });
    }

    return res.json({
      success: true,
      reviewed: false,
    });
  } catch (error) {
    console.error("Check Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check feedback",
      error: error.message,
    });
  }
});

// =====================================================
// SUBMIT OR UPDATE FEEDBACK
// POST /api/feedback
// =====================================================
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can submit product feedback.",
      });
    }

    const customerId = req.user.id;
    const { product_id, rating, comment, order_id } = req.body;

    const parsedProductId = Number(product_id);
    const parsedRating = Number(rating);

    if (!parsedProductId || Number.isNaN(parsedProductId)) {
      return res.status(400).json({
        success: false,
        message: "A valid product ID is required.",
      });
    }

    if (
      !parsedRating ||
      Number.isNaN(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars.",
      });
    }

    // Verify product exists
    const [products] = await db.query(
      "SELECT product_id, product_name FROM products WHERE product_id = ?",
      [parsedProductId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Optional: verify order_id if supplied
    let verifiedOrderId = null;
    if (order_id) {
      const parsedOrderId = Number(order_id);
      if (!Number.isNaN(parsedOrderId) && parsedOrderId > 0) {
        const [orders] = await db.query(
          `SELECT o.order_id 
           FROM orders o
           INNER JOIN order_items oi ON o.order_id = oi.order_id
           WHERE o.order_id = ? AND o.customer_id = ? AND oi.product_id = ?
           LIMIT 1`,
          [parsedOrderId, customerId, parsedProductId]
        );
        if (orders.length > 0) {
          verifiedOrderId = parsedOrderId;
        }
      }
    }

    // Check if this customer already submitted feedback for this product
    const [existing] = await db.query(
      `SELECT feedback_id FROM product_feedback 
       WHERE product_id = ? AND customer_id = ?
       LIMIT 1`,
      [parsedProductId, customerId]
    );

    const cleanComment = typeof comment === "string" ? comment.trim() : "";

    if (existing.length > 0) {
      const feedbackId = existing[0].feedback_id;
      await db.query(
        `UPDATE product_feedback
         SET rating = ?, comment = ?, order_id = COALESCE(?, order_id), updated_at = CURRENT_TIMESTAMP
         WHERE feedback_id = ?`,
        [parsedRating, cleanComment || null, verifiedOrderId, feedbackId]
      );

      return res.status(200).json({
        success: true,
        message: "Your feedback has been updated successfully!",
        feedback_id: feedbackId,
        is_updated: true,
      });
    }

    // If customer has an order for this product and didn't pass order_id, auto-link it!
    if (!verifiedOrderId) {
      const [customerOrders] = await db.query(
        `SELECT o.order_id 
         FROM orders o
         INNER JOIN order_items oi ON o.order_id = oi.order_id
         WHERE o.customer_id = ? AND oi.product_id = ?
         ORDER BY o.order_date DESC
         LIMIT 1`,
        [customerId, parsedProductId]
      );
      if (customerOrders.length > 0) {
        verifiedOrderId = customerOrders[0].order_id;
      }
    }

    const [result] = await db.query(
      `INSERT INTO product_feedback (product_id, customer_id, order_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [
        parsedProductId,
        customerId,
        verifiedOrderId || null,
        parsedRating,
        cleanComment || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Thank you! Your feedback has been submitted successfully.",
      feedback_id: result.insertId,
      is_updated: false,
    });
  } catch (error) {
    console.error("Submit Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
});

// =====================================================
// GET CUSTOMER'S OWN FEEDBACK
// GET /api/feedback/customer/:customerId
// =====================================================
router.get("/customer/:customerId", auth, async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);

    if (req.user.role !== "admin" && req.user.id !== customerId) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const [feedbackRows] = await db.query(
      `SELECT 
        fb.feedback_id,
        fb.product_id,
        fb.order_id,
        fb.rating,
        fb.comment,
        fb.created_at,
        p.product_name,
        p.category,
        p.image_url,
        p.price,
        p.unit
      FROM product_feedback fb
      INNER JOIN products p ON fb.product_id = p.product_id
      WHERE fb.customer_id = ?
      ORDER BY fb.created_at DESC`,
      [customerId]
    );

    return res.json({
      success: true,
      feedback: feedbackRows,
    });
  } catch (error) {
    console.error("Get Customer Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer feedback",
      error: error.message,
    });
  }
});

// =====================================================
// GET FARMER'S PRODUCTS FEEDBACK
// GET /api/feedback/farmer/:farmerId
// =====================================================
router.get("/farmer/:farmerId", auth, async (req, res) => {
  try {
    const farmerId = Number(req.params.farmerId);

    if (req.user.role !== "admin" && req.user.id !== farmerId) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const [feedbackRows] = await db.query(
      `SELECT 
        fb.feedback_id,
        fb.product_id,
        fb.customer_id,
        fb.order_id,
        fb.rating,
        fb.comment,
        fb.created_at,
        c.customer_name,
        p.product_name,
        p.image_url,
        p.category
      FROM product_feedback fb
      INNER JOIN products p ON fb.product_id = p.product_id
      LEFT JOIN customers c ON fb.customer_id = c.customer_id
      WHERE p.farmer_id = ?
      ORDER BY fb.created_at DESC`,
      [farmerId]
    );

    let totalScore = 0;
    feedbackRows.forEach((r) => {
      totalScore += Number(r.rating);
    });

    const totalCount = feedbackRows.length;
    const avgRating =
      totalCount > 0 ? Number((totalScore / totalCount).toFixed(1)) : 0;

    return res.json({
      success: true,
      stats: {
        total_feedback: totalCount,
        average_rating: avgRating,
      },
      feedback: feedbackRows,
    });
  } catch (error) {
    console.error("Get Farmer Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch farmer feedback",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE FEEDBACK
// DELETE /api/feedback/:feedbackId
// =====================================================
router.delete("/:feedbackId", auth, async (req, res) => {
  try {
    const feedbackId = Number(req.params.feedbackId);

    const [existing] = await db.query(
      "SELECT feedback_id, customer_id FROM product_feedback WHERE feedback_id = ?",
      [feedbackId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.id !== existing[0].customer_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own feedback.",
      });
    }

    await db.query("DELETE FROM product_feedback WHERE feedback_id = ?", [
      feedbackId,
    ]);

    return res.json({
      success: true,
      message: "Feedback deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
      error: error.message,
    });
  }
});

module.exports = router;
