const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./shared/errorHandler');
const { requireAuth, requireRol } = require('./modules/auth/auth.middleware');
const empresaRoutes = require('./modules/empresa/empresa.routes');

const app = express();

app.set('trust proxy', 'loopback'); // para leer bien la IP si se publica detrás de un proxy local
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' })); // el logo viaja como data URL

/* ---------- Rutas públicas ---------- */
app.get('/api/health', (req, res) => res.json({ ok: true }));
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
