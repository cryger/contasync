import { Chip } from "@mui/material";
import CrudPage from "../../components/CrudPage";
import { productosApi } from "../../api";
import { formatoMoneda } from "../../utils/format";
import { useAuth } from "../../auth/AuthContext";

const campos = [
  { name: "codigo", label: "Código (opcional)", xs: 4 },
  { name: "nombre", label: "Nombre", required: true, xs: 8 },
  { name: "precio", label: "Precio sin IVA", type: "number", required: true, xs: 6 },
  { name: "iva_porcentaje", label: "IVA %", type: "select", options: [0, 5, 19], xs: 3 },
  { name: "activo", label: "Estado", type: "select", options: [{ value: true, label: "Activo" }, { value: false, label: "Inactivo" }], xs: 3 },
];

const columns = [
  { field: "codigo", headerName: "Código", width: 110 },
  { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 200 },
  { field: "precio", headerName: "Precio", width: 140, align: "right", headerAlign: "right", valueFormatter: ({ value }) => formatoMoneda(value) },
  { field: "iva_porcentaje", headerName: "IVA %", width: 80, align: "right", headerAlign: "right" },
  {
    field: "activo", headerName: "Estado", width: 110,
    renderCell: ({ value }) => <Chip size="small" label={value ? "Activo" : "Inactivo"} color={value ? "success" : "default"} />,
  },
];

export default function ProductosPage() {
  const { esAdmin } = useAuth();
  return (
    <CrudPage
      title="Productos y servicios"
      subtitle="Catálogo para facturar en segundos"
      singular="Producto"
      api={productosApi}
      columns={columns}
      campos={campos}
      nuevoInicial={{ iva_porcentaje: 19, activo: true }}
      soloLectura={!esAdmin}
    />
  );
}
