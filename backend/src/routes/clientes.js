// routes/clientes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Obtener todos los clientes
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// Crear nuevo cliente
router.post("/", async (req, res) => {
  const { nombre, identificacion, telefono, email, direccion } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO clientes (nombre, identificacion, telefono, email, direccion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, identificacion, telefono, email, direccion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
});

// Actualizar cliente existente
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, identificacion, telefono, email, direccion } = req.body;

  try {
    const result = await pool.query(
      `UPDATE clientes
       SET nombre = $1, identificacion = $2, telefono = $3, email = $4, direccion = $5
       WHERE id = $6 RETURNING *`,
      [nombre, identificacion, telefono, email, direccion, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

// Eliminar cliente
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM clientes WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
});

module.exports = router;
