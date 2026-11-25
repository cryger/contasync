require('dotenv').config();
const app = require('./app');
const { iniciarProgramador } = require('./modules/cobros/cobros.service');

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`✔ API Contasync en http://localhost:${PORT}/api`);
  iniciarProgramador(); // genera los cobros mensuales automáticamente
});
