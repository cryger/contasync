import axios from "axios";

export const CLAVE_TOKEN = "contasync-token";

export const leerToken = () => {
  try { return localStorage.getItem(CLAVE_TOKEN); } catch { return null; }
};
export const guardarToken = (t) => {
  try { t ? localStorage.setItem(CLAVE_TOKEN, t) : localStorage.removeItem(CLAVE_TOKEN); } catch { /* sin storage */ }
};

// Usa el proxy de Vite (/api). En producción define VITE_API_URL=https://tu-servidor/api
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// Envía el token en cada petición
client.interceptors.request.use((config) => {
  const token = leerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el servidor dice 401 (sesión vencida o usuario desactivado), se avisa a la app para cerrar sesión
client.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.startsWith("/auth/login")) {
      window.dispatchEvent(new CustomEvent("contasync:sesion-expirada", { detail: err.response.data?.error }));
    }
    return Promise.reject(err);
  }
);

/** Extrae un mensaje legible de cualquier error de axios. */
export const mensajeError = (err) =>
  err?.response?.data?.error ||
  (err?.code === "ERR_NETWORK" ? "No hay conexión con el servidor" : err?.message) ||
  "Error inesperado";

export default client;
