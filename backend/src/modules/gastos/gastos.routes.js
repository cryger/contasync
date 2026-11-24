const { crearCrud } = require('../../shared/crud');
const v = require('../../shared/validate');

const { router } = crearCrud({
  tabla: 'gastos',
  nombre: 'Gasto',
  orden: 'fecha DESC, id DESC',
  busqueda: ['descripcion', 'categoria'],
  filtros: { categoria: 'categoria' },
  campos: {
    fecha: (x) => v.optionalDate(x) || new Date().toISOString().slice(0, 10),
    descripcion: (x) => v.requireText(x, 'descripción'),
    categoria: (x) => v.optionalText(x) || 'General',
    monto: (x) => v.requireNumber(x, 'monto', { min: 0, allowZero: false }),
    medio_pago: (x) => v.optionalText(x) || 'efectivo',
  },
});

module.exports = router;
