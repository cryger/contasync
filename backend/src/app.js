require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const ingresosRoutes = require("./routes/ingresos");
const gastosRoutes = require("./routes/gastos");
const recibosRoutes = require("./routes/recibos");
const proyectosRoutes = require("./routes/proyectos");
const clientesRouter = require("./routes/clientes");
const suppliersRoutes = require("./routes/suppliers");
const inversionesRoutes = require("./routes/inversiones.routes");
const bancosRouter = require('./routes/bancos');
const empleadosRouter = require('./routes/empleados');
const cuentasRoutes = require('./routes/cuentas');
const centrosCostosRouter = require('./routes/centrosCostos');
const presupuestosRouter = require('./routes/presupuestos');
const app = express();

// Configuración básica de middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Rutas
app.use('/api', userRoutes); // Esto hará que todas las rutas empiecen con /api
app.use("/api/ingresos", ingresosRoutes);
app.use("/api/gastos", gastosRoutes);
app.use("/api/recibos", recibosRoutes);
app.use("/api/proyectos", proyectosRoutes);
app.use("/api/clientes", clientesRouter); 
app.use("/api/proveedores", suppliersRoutes);
app.use("/api/inversiones", inversionesRoutes);
app.use('/api/bancos', bancosRouter);
app.use('/api/empleados', empleadosRouter);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/centros-costos', centrosCostosRouter);
app.use('/api/presupuestos', presupuestosRouter);

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});