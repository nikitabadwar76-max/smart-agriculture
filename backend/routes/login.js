const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
  const { mobile, password } = req.body;

  try {
    // Check farmer
    const [farmers] = await db.query(
      "SELECT * FROM farmers WHERE mobile = ?",
      [mobile]
    );

    if (farmers.length > 0) {
      const farmer = farmers[0];

      const passwordMatch = await bcrypt.compare(
        password,
        farmer.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid mobile number or password.",
        });
      }

      const token = jwt.sign(
        {
          id: farmer.farmer_id,
          role: "farmer",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      return res.json({
        success: true,
        message: "Farmer login successful.",
        token,
        userType: "farmer",
        farmer: {
          farmer_id: farmer.farmer_id,
          farmer_name: farmer.farmer_name,
          email: farmer.email,
          mobile: farmer.mobile,
          location: farmer.location,
          address: farmer.address,
        },
      });
    }

    // Check customer
    const [customers] = await db.query(
      "SELECT * FROM customers WHERE mobile = ?",
      [mobile]
    );

    if (customers.length > 0) {
      const customer = customers[0];

      const passwordMatch = await bcrypt.compare(
        password,
        customer.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid mobile number or password.",
        });
      }

      const token = jwt.sign(
        {
          id: customer.customer_id,
          role: "customer",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      return res.json({
        success: true,
        message: "Customer login successful.",
        token,
        userType: "customer",
        customer: {
          customer_id: customer.customer_id,
          customer_name: customer.customer_name,
          mobile: customer.mobile,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid mobile number or password.",
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
});

module.exports = router;