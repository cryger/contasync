const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./shared/errorHandler');
const { requireAuth, requireRol } = require('./modules/auth/auth.middleware');
const empresaRoutes = require('./modules/empresa/empresa.routes');

const app = express();

app.set('trust proxy', process.env.VERCEL ? true : 'loopback'); // IP real del cliente detrás del proxy
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' })); // el logo viaja como data URL

// En Vercel la base se prepara sola en el primer request (crea tablas si faltan)
if (process.env.VERCEL) {
  const { asegurarEsquema } = require('../database/esquema');
  app.use((req, res, next) => asegurarEsquema().then(() => next(), next));
}

/* ---------- Rutas públicas ---------- */
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Cron de Vercel (diario): genera los cobros mensuales.
// Es seguro aunque se llame de más: solo emite lo que ya venció y nunca duplica un mes.
// Si defines CRON_SECRET en Vercel, solo se acepta la llamada que trae esa clave (Vercel la envía sola).
app.get('/api/cron/cobros', async (req, res, next) => {
  try {
    const secreto = process.env.CRON_SECRET;
    if (secreto && req.headers.authorization !== `Bearer ${secreto}`) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const r = await require('./modules/cobros/cobros.service').generarPendientes();
    res.json({ generadas: r.generadas.length, errores: r.errores });
  } catch (err) {
    next(err);
  }
});
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.get('/api/marca', empresaRoutes.marca); // logo y colores para la pantalla de login

/* ---------- Desde aquí todo exige sesión ---------- */
app.use('/api', requireAuth);

const soloAdmin = requireRol('admin');
// Todos leen; solo el administrador crea, edita o borra
const escrituraAdmin = (req, res, next) => (req.method === 'GET' ? next() : soloAdmin(req, res, next));

// Administrador y cajero
app.use('/api/empresa', empresaRoutes); // GET para todos, PUT solo admin (dentro del módulo)
app.use('/api/clientes', require('./modules/clientes/clientes.routes'));
app.use('/api/productos', escrituraAdmin, require('./modules/productos/productos.routes'));
app.use('/api/facturas', require('./modules/facturas/facturas.routes')); // anular: solo admin

// Solo administrador
app.use('/api/gastos', soloAdmin, require('./modules/gastos/gastos.routes'));
app.use('/api/inversionistas', soloAdmin, require('./modules/inversionistas/inversionistas.routes'));
app.use('/api/dashboard', soloAdmin, require('./modules/dashboard/dashboard.routes'));
app.use('/api/usuarios', soloAdmin, require('./modules/usuarios/usuarios.routes'));
app.use('/api/cobros', soloAdmin, require('./modules/cobros/cobros.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
