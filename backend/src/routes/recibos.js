const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (_, res) => {
  const result = await pool.query("SELECT * FROM recibos ORDER BY id DESC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { ingreso_id, gasto_id, fecha, monto } = req.body;
  const result = await pool.query(
    "INSERT INTO recibos (ingreso_id, gasto_id, fecha, monto) VALUES ($1, $2, $3, $4) RETURNING *",
    [ingreso_id, gasto_id, fecha, monto]
  );
  res.json(result.rows[0]);
});

module.exports = router;
