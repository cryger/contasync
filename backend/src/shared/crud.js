const pool = require('../config/db');
const { HttpError, asyncHandler, parseId } = require('./http');

/**
 * Genera servicio + router CRUD para tablas simples.
 * @param {object} cfg
 * @param {string} cfg.tabla
 * @param {string} cfg.nombre      Nombre en singular para los mensajes ("Cliente")
 * @param {object} cfg.campos      { campo: (valor) => valorNormalizado }  (lanza HttpError si no es válido)
 * @param {string[]} cfg.busqueda  Columnas donde busca ?q=
 * @param {string} cfg.orden       ORDER BY
 * @param {object} [cfg.filtros]   { param: 'columna' } filtros exactos por query string
 */
function crearCrud({ tabla, nombre, campos, busqueda = [], orden = 'id DESC', filtros = {} }) {
  const columnas = Object.keys(campos);

  function leerCuerpo(body, parcial = false) {
    const datos = {};
    for (const col of columnas) {
      if (parcial && !(col in body)) continue;
      datos[col] = campos[col](body[col]);
    }
    return datos;
  }

  const service = {
    async listar(query = {}) {
      const cond = [];
      const params = [];
      if (query.q && busqueda.length) {
        params.push(`%${query.q}%`);
        cond.push(`(${busqueda.map((c) => `${c}::text ILIKE $${params.length}`).join(' OR ')})`);
      }
      for (const [param, col] of Object.entries(filtros)) {
        if (query[param] !== undefined && query[param] !== '') {
          params.push(query[param]);
          cond.push(`${col} = $${params.length}`);
        }
      }
      const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
      const { rows } = await pool.query(`SELECT * FROM ${tabla} ${where} ORDER BY ${orden}`, params);
      return rows;
    },

    async obtener(id) {
      const { rows } = await pool.query(`SELECT * FROM ${tabla} WHERE id = $1`, [id]);
      if (!rows[0]) throw new HttpError(404, `${nombre} no encontrado`);
      return rows[0];
    },

    async crear(body) {
      const datos = leerCuerpo(body);
      const cols = Object.keys(datos);
      const { rows } = await pool.query(
        `INSERT INTO ${tabla} (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
        Object.values(datos),
      );
      return rows[0];
    },

    async actualizar(id, body) {
      const datos = leerCuerpo(body, true);
      const cols = Object.keys(datos);
      if (!cols.length) return service.obtener(id);
      const { rows } = await pool.query(
        `UPDATE ${tabla} SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} WHERE id = $${cols.length + 1} RETURNING *`,
        [...Object.values(datos), id],
      );
      if (!rows[0]) throw new HttpError(404, `${nombre} no encontrado`);
      return rows[0];
    },

    async eliminar(id) {
      const { rowCount } = await pool.query(`DELETE FROM ${tabla} WHERE id = $1`, [id]);
      if (!rowCount) throw new HttpError(404, `${nombre} no encontrado`);
    },
  };

  const router = require('express').Router();
  router.get('/', asyncHandler(async (req, res) => res.json(await service.listar(req.query))));
  router.get('/:id', asyncHandler(async (req, res) => res.json(await service.obtener(parseId(req.params.id)))));
  router.post('/', asyncHandler(async (req, res) => res.status(201).json(await service.crear(req.body))));
  router.put('/:id', asyncHandler(async (req, res) => res.json(await service.actualizar(parseId(req.params.id), req.body))));
  router.delete('/:id', asyncHandler(async (req, res) => {
    await service.eliminar(parseId(req.params.id));
    res.status(204).end();
  }));

  return { service, router };
}

module.exports = { crearCrud };
