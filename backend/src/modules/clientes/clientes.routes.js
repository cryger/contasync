const { crearCrud } = require('../../shared/crud');
const v = require('../../shared/validate');

const TIPOS_DOC = ['CC', 'NIT', 'CE', 'TI', 'PP', 'PEP'];

const { router } = crearCrud({
  tabla: 'clientes',
  nombre: 'Cliente',
  orden: 'nombre ASC',
  busqueda: ['nombre', 'identificacion', 'email', 'telefono'],
  campos: {
    tipo_documento: (x) => v.oneOf(x, TIPOS_DOC, 'tipo_documento', 'CC'),
    identificacion: (x) => v.requireText(x, 'identificación'),
    nombre: (x) => v.requireText(x, 'nombre'),
    telefono: v.optionalText,
    email: v.optionalText,
    direccion: v.optionalText,
  },
});

module.exports = router;
