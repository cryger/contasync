const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Obtener todos los proyectos
router.get("/", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM proyectos ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
});

// Crear un nuevo proyecto
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion, presupuesto, fecha_inicio, fecha_fin } = req.body;

    if (!nombre || !descripcion || !presupuesto || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const result = await pool.query(
      `INSERT INTO proyectos (nombre, descripcion, presupuesto, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, descripcion, presupuesto, fecha_inicio, fecha_fin]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(500).json({ error: "Error al crear proyecto" });
  }
});

// Actualizar un proyecto existente
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, presupuesto, fecha_inicio, fecha_fin } = req.body;

    if (!nombre || !descripcion || !presupuesto || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const result = await pool.query(
      `UPDATE proyectos 
       SET nombre = $1, descripcion = $2, presupuesto = $3, fecha_inicio = $4, fecha_fin = $5
       WHERE id = $6
       RETURNING *`,
      [nombre, descripcion, presupuesto, fecha_inicio, fecha_fin, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    res.status(500).json({ error: "Error al actualizar proyecto" });
  }
});

// Eliminar un proyecto
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM proyectos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    res.json({ message: "Proyecto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    res.status(500).json({ error: "Error al eliminar proyecto" });
  }
});

module.exports = router;
