// routes/gastos.js
const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM gastos ORDER BY id ASC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { descripcion, monto, categoria, metodo_pago } = req.body;
  const result = await pool.query(
    "INSERT INTO gastos (descripcion, monto, categoria, metodo_pago) VALUES ($1, $2, $3, $4) RETURNING *",
    [descripcion, monto, categoria, metodo_pago]
  );
  res.json(result.rows[0]);
});

module.exports = router;