const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const ordersRoutes = require("./routes/orders");
const productsRoutes = require("./routes/products");
const farmerRoutes = require("./routes/farmers");
const customersRoutes = require("./routes/customers");
const loginRoutes = require("./routes/login");

// API Routes
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/login", loginRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Smart Agriculture Backend is running"
    });
});

// Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});