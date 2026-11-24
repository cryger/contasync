/* eslint-disable react-refresh/only-export-components */
import CrudPage from "../../components/CrudPage";
import { clientesApi } from "../../api";

export const CAMPOS_CLIENTE = [
  { name: "tipo_documento", label: "Tipo doc.", type: "select", options: ["CC", "NIT", "CE", "TI", "PP", "PEP"], xs: 4, required: true },
  { name: "identificacion", label: "Número de documento", required: true, xs: 8 },
  { name: "nombre", label: "Nombre o razón social", required: true },
  { name: "telefono", label: "Teléfono", xs: 6 },
  { name: "email", label: "Correo", type: "email", xs: 6 },
  { name: "direccion", label: "Dirección" },
];

const columns = [
  { field: "tipo_documento", headerName: "Tipo", width: 70 },
  { field: "identificacion", headerName: "Documento", width: 140 },
  { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 180 },
  { field: "telefono", headerName: "Teléfono", width: 140 },
  { field: "email", headerName: "Correo", flex: 1, minWidth: 180 },
  { field: "direccion", headerName: "Dirección", flex: 1, minWidth: 160 },
];

export default function ClientesPage() {
  return (
    <CrudPage
      title="Clientes"
      subtitle="A quién le facturas"
      singular="Cliente"
      api={clientesApi}
      columns={columns}
      campos={CAMPOS_CLIENTE}
      nuevoInicial={{ tipo_documento: "CC" }}
    />
  );
}
