const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// -------------------- DATABASE --------------------
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) return console.error("Database error:", err);
  console.log("Database connected.");
});

// Create users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  )
`);

// Create menu table
db.run(`
  CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER,
    image TEXT
  )
`);

// Create orders table
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    items TEXT,
    total INTEGER,
    date TEXT
  )
`);

// -------------------- REGISTER --------------------
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, hashed],
    (err) => {
      if (err) return res.json({ success: false, error: "Email sudah terdaftar" });
      res.json({ success: true, message: "Registrasi berhasil" });
    }
  );
});

// -------------------- LOGIN --------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.json({ success: false, error: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, error: "Password salah" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secretkey");

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  });
});

// -------------------- GET MENU --------------------
app.get("/menu", (req, res) => {
  db.all(`SELECT * FROM menu`, [], (err, rows) => {
    res.json(rows);
  });
});

// -------------------- TAMBAH MENU (ADMIN) --------------------
app.post("/menu", (req, res) => {
  const { name, price, image } = req.body;

  db.run(
    `INSERT INTO menu (name, price, image) VALUES (?, ?, ?)`,
    [name, price, image],
    (err) => {
      if (err) return res.json({ success: false });
      res.json({ success: true });
    }
  );
});

// -------------------- CHECKOUT --------------------
app.post("/order", (req, res) => {
  const { user_id, items, total } = req.body;
  const date = new Date().toISOString();

  db.run(
    `INSERT INTO orders (user_id, items, total, date) VALUES (?, ?, ?, ?)`,
    [user_id, JSON.stringify(items), total, date],
    (err) => {
      if (err) return res.json({ success: false });
      res.json({ success: true, message: "Pesanan berhasil dibuat" });
    }
  );
});

// -------------------- GET ORDER USER --------------------
app.get("/orders/:user_id", (req, res) => {
  db.all(
    `SELECT * FROM orders WHERE user_id = ?`,
    [req.params.user_id],
    (err, rows) => {
      res.json(rows);
    }
  );
});

app.get("/orders", (req, res) => {
    db.all(
        `
        SELECT orders.*, users.name AS user_name 
        FROM orders
        LEFT JOIN users ON users.id = orders.user_id
        ORDER BY orders.id DESC
        `,
        [],
        (err, rows) => {
            res.json(rows);
        }
    );
});

app.put("/orders/:id", (req, res) => {
    const { status } = req.body;

    db.run(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, req.params.id],
        err => {
            if (err) return res.json({ success: false });
            res.json({ success: true });
        }
    );
});


// -------------------- RUN SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
