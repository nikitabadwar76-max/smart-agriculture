const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

async function comparePassword(inputPassword, storedPassword) {
  if (!storedPassword) return false;
  if (
    storedPassword.startsWith("$2a$") ||
    storedPassword.startsWith("$2b$") ||
    storedPassword.startsWith("$2y$")
  ) {
    try {
      return await bcrypt.compare(inputPassword, storedPassword);
    } catch {
      return false;
    }
  }
  return inputPassword === storedPassword;
}

router.post("/", async (req, res) => {
  const { mobile, password, role } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({
      success: false,
      message: "Mobile number/username and password are required.",
    });
  }

  const cleanMobile = String(mobile).trim();

  try {
    // 1. ADMIN LOGIN
    if (role === "admin" || cleanMobile.toLowerCase() === "admin") {
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

      if (
        cleanMobile.toLowerCase() === adminUsername.toLowerCase() &&
        password === adminPassword
      ) {
        const token = jwt.sign(
          {
            id: 0,
            role: "admin",
            username: adminUsername,
          },
          process.env.JWT_SECRET || "smart_agriculture_secret_key_2026",
          { expiresIn: "1d" }
        );

        return res.json({
          success: true,
          message: "Admin login successful.",
          token,
          userType: "admin",
          admin: {
            username: adminUsername,
            role: "admin",
          },
        });
      }

      if (role === "admin") {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials.",
        });
      }
    }

    // 2. FARMER LOGIN
    if (!role || role === "farmer") {
      const [farmers] = await db.query(
        "SELECT * FROM farmers WHERE mobile = ? OR email = ?",
        [cleanMobile, cleanMobile]
      );

      if (farmers.length > 0) {
        const farmer = farmers[0];

        const passwordMatch = await comparePassword(password, farmer.password);

        if (!passwordMatch) {
          if (role === "farmer") {
            return res.status(401).json({
              success: false,
              message: "Invalid mobile number or password.",
            });
          }
        } else {
          if (farmer.status && farmer.status.toLowerCase() !== "active") {
            return res.status(403).json({
              success: false,
              message: "Your farmer account is inactive. Please contact admin.",
            });
          }

          const token = jwt.sign(
            {
              id: farmer.farmer_id,
              role: "farmer",
            },
            process.env.JWT_SECRET || "smart_agriculture_secret_key_2026",
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
      } else if (role === "farmer") {
        return res.status(401).json({
          success: false,
          message: "No farmer account found with this mobile number.",
        });
      }
    }

    // 3. CUSTOMER LOGIN
    if (!role || role === "customer") {
      const [customers] = await db.query(
        "SELECT * FROM customers WHERE mobile = ?",
        [cleanMobile]
      );

      if (customers.length > 0) {
        const customer = customers[0];

        const passwordMatch = await comparePassword(password, customer.password);

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
          process.env.JWT_SECRET || "smart_agriculture_secret_key_2026",
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
      } else if (role === "customer") {
        return res.status(401).json({
          success: false,
          message: "No customer account found with this mobile number.",
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials.",
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