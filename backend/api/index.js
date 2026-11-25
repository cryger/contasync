// Punto de entrada para Vercel: toda la API corre como una función serverless.
// vercel.json redirige todas las rutas aquí; Express recibe la URL original (/api/...).
module.exports = require('../src/app');
