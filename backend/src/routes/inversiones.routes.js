// routes/inversiones.routes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Middleware para validar id params
function validarIdParam(req, res, next) {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID inválido" });
  }
  next();
}

// Obtener todas las inversiones
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        inv.id, inv.usuario_id, inv.proyecto_id, 
        inv.monto_invertido, inv.porcentaje_participacion,
        u.nombre AS nombre_usuario,
        p.nombre AS nombre_proyecto
      FROM inversiones inv
      LEFT JOIN usuarios u ON inv.usuario_id = u.id
      LEFT JOIN proyectos p ON inv.proyecto_id = p.id
      ORDER BY inv.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener inversiones:", err);
    res.status(500).json({ error: "Error al obtener inversiones" });
  }
});

// Crear una inversión
router.post("/", async (req, res) => {
  const { usuario_id, proyecto_id, monto_invertido, porcentaje_participacion } = req.body;

  // Validar entradas
  if (
    !usuario_id || isNaN(parseInt(usuario_id, 10)) ||
    !proyecto_id || isNaN(parseInt(proyecto_id, 10)) ||
    monto_invertido == null || isNaN(parseFloat(monto_invertido)) ||
    porcentaje_participacion == null || isNaN(parseFloat(porcentaje_participacion))
  ) {
    return res.status(400).json({ error: "Datos inválidos o incompletos" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO inversiones (usuario_id, proyecto_id, monto_invertido, porcentaje_participacion)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [usuario_id, proyecto_id, monto_invertido, porcentaje_participacion]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al crear inversión:", err);
    res.status(500).json({ error: "Error al crear inversión" });
  }
});

// Actualizar una inversión
router.put("/:id", validarIdParam, async (req, res) => {
  const { id } = req.params;
  const { usuario_id, proyecto_id, monto_invertido, porcentaje_participacion } = req.body;

  // Validar entradas
  if (
    !usuario_id || isNaN(parseInt(usuario_id, 10)) ||
    !proyecto_id || isNaN(parseInt(proyecto_id, 10)) ||
    monto_invertido == null || isNaN(parseFloat(monto_invertido)) ||
    porcentaje_participacion == null || isNaN(parseFloat(porcentaje_participacion))
  ) {
    return res.status(400).json({ error: "Datos inválidos o incompletos" });
  }

  try {
    const result = await pool.query(
      `UPDATE inversiones
       SET usuario_id = $1, proyecto_id = $2, monto_invertido = $3, porcentaje_participacion = $4
       WHERE id = $5 RETURNING *`,
      [usuario_id, proyecto_id, monto_invertido, porcentaje_participacion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inversión no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar inversión:", err);
    res.status(500).json({ error: "Error al actualizar inversión" });
  }
});

// Eliminar una inversión
router.delete("/:id", validarIdParam, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM inversiones WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inversión no encontrada" });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error("Error al eliminar inversión:", err);
    res.status(500).json({ error: "Error al eliminar inversión" });
  }
});

module.exports = router;
