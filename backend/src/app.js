const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./shared/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' })); // el logo viaja como data URL

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/empresa', require('./modules/empresa/empresa.routes'));
app.use('/api/clientes', require('./modules/clientes/clientes.routes'));
app.use('/api/productos', require('./modules/productos/productos.routes'));
app.use('/api/facturas', require('./modules/facturas/facturas.routes'));
app.use('/api/gastos', require('./modules/gastos/gastos.routes'));
app.use('/api/inversionistas', require('./modules/inversionistas/inversionistas.routes'));
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
