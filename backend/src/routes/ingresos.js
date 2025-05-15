const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM ingresos ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener ingresos:", error);
    res.status(500).json({ error: "Error al obtener ingresos" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { valor_recibido, saldo_anterior, saldo_en_caja, total_ingresos } = req.body;
    const result = await pool.query(
      "INSERT INTO ingresos (valor_recibido, saldo_anterior, saldo_en_caja, total_ingresos) VALUES ($1, $2, $3, $4) RETURNING *",
      [valor_recibido, saldo_anterior, saldo_en_caja, total_ingresos]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear ingreso:", error);
    res.status(500).json({ error: "Error al crear ingreso" });
  }
});

module.exports = router;
