// routes/ingresos.js
const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ingresos");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { valor_recibido, saldo_anterior, saldo_en_caja, total_ingresos } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO ingresos (valor_recibido, saldo_anterior, saldo_en_caja, total_ingresos) VALUES ($1, $2, $3, $4) RETURNING *",
      [valor_recibido, saldo_anterior, saldo_en_caja, total_ingresos]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
