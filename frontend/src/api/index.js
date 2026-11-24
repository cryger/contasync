import client from "./client";

const data = (p) => p.then((r) => r.data);

/** CRUD estándar para un recurso REST. */
const recurso = (ruta) => ({
  listar: (params) => data(client.get(ruta, { params })),
  obtener: (id) => data(client.get(`${ruta}/${id}`)),
  crear: (body) => data(client.post(ruta, body)),
  actualizar: (id, body) => data(client.put(`${ruta}/${id}`, body)),
  eliminar: (id) => data(client.delete(`${ruta}/${id}`)),
});

export const clientesApi = recurso("/clientes");
export const productosApi = recurso("/productos");
export const gastosApi = recurso("/gastos");

export const facturasApi = {
  listar: (params) => data(client.get("/facturas", { params })),
  obtener: (id) => data(client.get(`/facturas/${id}`)),
  crear: (body) => data(client.post("/facturas", body)),
  cambiarEstado: (id, estado) => data(client.patch(`/facturas/${id}/estado`, { estado })),
};

export const inversionistasApi = {
  ...recurso("/inversionistas"),
  aportes: (id) => data(client.get(`/inversionistas/${id}/aportes`)),
  crearAporte: (id, body) => data(client.post(`/inversionistas/${id}/aportes`, body)),
  eliminarAporte: (aporteId) => data(client.delete(`/inversionistas/aportes/${aporteId}`)),
  reparto: (params) => data(client.get("/inversionistas/reparto", { params })),
};

export const empresaApi = {
  obtener: () => data(client.get("/empresa")),
  actualizar: (body) => data(client.put("/empresa", body)),
};

export const dashboardApi = {
  obtener: (params) => data(client.get("/dashboard", { params })),
};
