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
  (r) => {
    if (typeof r.data === "string" && r.data.trimStart().startsWith("<")) {
      const err = new Error("Respuesta inválida de la API");
      err.response = { status: 502, headers: { "content-type": "text/html" }, data: {} };
      return Promise.reject(err);
    }
    return r;
  },
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.startsWith("/auth/login")) {
      const detalle = err.response.data?.error;
      window.dispatchEvent(new CustomEvent("contasync:sesion-expirada", { detail: typeof detalle === "string" ? detalle : undefined }));
    }
    return Promise.reject(err);
  }
);

/** Extrae un mensaje legible de cualquier error de axios. */
export const mensajeError = (err) => {
  // Solo se muestran mensajes de texto: algunos servidores (p. ej. el 404 de Vercel) mandan "error" como objeto
  const msg = err?.response?.data?.error;
  if (typeof msg === "string") return msg;
  const tipo = String(err?.response?.headers?.["content-type"] || "");
  // Sin backend (p. ej. el frontend publicado sin VITE_API_URL) el servidor responde 404/HTML en vez de JSON
  if (err?.code === "ERR_NETWORK" || [404, 405, 502, 503, 504].includes(err?.response?.status) || tipo.includes("text/html")) {
    return "No se pudo conectar con el servidor de Contasync. Revisa que el backend esté encendido y la dirección de la API (VITE_API_URL).";
  }
  return err?.message || "Error inesperado";
};

export default client;
