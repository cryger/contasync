const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Obtener todos los proveedores
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM proveedores ORDER BY id ASC");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
});

// Crear un proveedor
router.post("/", async (req, res) => {
  const { nombre, identificacion, telefono, email, direccion } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO proveedores (nombre, identificacion, telefono, email, direccion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, identificacion, telefono, email, direccion]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    res.status(500).json({ error: "Error al crear proveedor" });
  }
});

// Actualizar un proveedor
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, identificacion, telefono, email, direccion } = req.body;
  try {
    await pool.query(
      `UPDATE proveedores SET nombre=$1, identificacion=$2, telefono=$3, email=$4, direccion=$5
       WHERE id=$6`,
      [nombre, identificacion, telefono, email, direccion, id]
    );
    res.sendStatus(204);
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    res.status(500).json({ error: "Error al actualizar proveedor" });
  }
});

// Eliminar un proveedor
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM proveedores WHERE id = $1", [id]);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    res.status(500).json({ error: "Error al eliminar proveedor" });
  }
});

module.exports = router;
