const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Middleware check token
function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ success: false, error: "Token tidak ada" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, "AAI_SECRET_KEY", (err, user) => {
        if (err) return res.status(403).json({ success: false, error: "Token tidak valid" });
        req.user = user;
        next();
    });
}

// Create Order
router.post("/", authMiddleware, (req, res) => {
    const userId = req.user.id;
    const order = req.body;

    const query = `
        INSERT INTO orders (user_id, items, subtotal, delivery_cost, service_cost, total, delivery_address, city, postal_code, notes, delivery_time, payment_method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(query, [
        userId,
        JSON.stringify(order.items),
        order.subtotal,
        order.deliveryCost,
        order.serviceCost,
        order.total,
        order.delivery.address,
        order.delivery.city,
        order.delivery.postalCode,
        order.delivery.notes,
        order.delivery.time,
        order.paymentMethod
    ], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });

        res.json({
            success: true,
            message: "Pesanan berhasil dibuat",
            orderId: result.insertId
        });
    });
});

// Get all orders for admin
router.get("/", authMiddleware, (req, res) => {
    const user = req.user;
    
    // Hanya admin boleh melihat semuanya
    if (user.role !== "admin") {
        return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    db.query("SELECT * FROM orders ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });

        res.json({ success: true, orders: result });
    });
});

// Get orders by logged user
router.get("/me", authMiddleware, (req, res) => {
    const userId = req.user.id;

    db.query("SELECT * FROM orders WHERE user_id = ?", [userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });

        res.json({ success: true, orders: result });
    });
});

module.exports = router;
