const { crearCrud } = require('../../shared/crud');
const v = require('../../shared/validate');

const { router } = crearCrud({
  tabla: 'productos',
  nombre: 'Producto',
  orden: 'nombre ASC',
  busqueda: ['nombre', 'codigo'],
  filtros: { activo: 'activo' },
  campos: {
    codigo: v.optionalText,
    nombre: (x) => v.requireText(x, 'nombre'),
    precio: (x) => v.requireNumber(x, 'precio', { min: 0 }),
    iva_porcentaje: (x) => (x === undefined || x === '' ? 19 : v.requireNumber(x, 'IVA', { min: 0 })),
    activo: (x) => x !== false && x !== 'false',
  },
});

module.exports = router;
