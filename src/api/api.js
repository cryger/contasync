import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Asegúrate que coincida con tu backend
  timeout: 10000,
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la petición:', error.response || error);
    return Promise.reject(error);
  }
);

export default api;