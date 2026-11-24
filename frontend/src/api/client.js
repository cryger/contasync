import axios from "axios";

// Usa el proxy de Vite (/api). En producción define VITE_API_URL=https://tu-servidor/api
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

/** Extrae un mensaje legible de cualquier error de axios. */
export const mensajeError = (err) =>
  err?.response?.data?.error ||
  (err?.code === "ERR_NETWORK" ? "No hay conexión con el servidor" : err?.message) ||
  "Error inesperado";

export default client;
