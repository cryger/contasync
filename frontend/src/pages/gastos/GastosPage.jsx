import CrudPage from "../../components/CrudPage";
import { gastosApi } from "../../api";
import { formatoFecha, formatoMoneda, hoy } from "../../utils/format";
import { MEDIOS_PAGO } from "../../utils/factura";

const CATEGORIAS = ["General", "Arriendo", "Servicios públicos", "Nómina", "Insumos", "Transporte", "Publicidad", "Impuestos", "Software", "Otros"];

const campos = [
  { name: "fecha", label: "Fecha", type: "date", required: true, xs: 6 },
  { name: "monto", label: "Monto", type: "number", required: true, xs: 6 },
  { name: "descripcion", label: "Descripción", required: true },
  { name: "categoria", label: "Categoría", type: "select", options: CATEGORIAS, xs: 6 },
  { name: "medio_pago", label: "Medio de pago", type: "select", options: MEDIOS_PAGO, xs: 6 },
];

const columns = [
  { field: "fecha", headerName: "Fecha", width: 110, valueFormatter: ({ value }) => formatoFecha(value) },
  { field: "descripcion", headerName: "Descripción", flex: 1, minWidth: 200 },
  { field: "categoria", headerName: "Categoría", width: 160 },
  { field: "medio_pago", headerName: "Medio", width: 130 },
  { field: "monto", headerName: "Monto", width: 140, align: "right", headerAlign: "right", valueFormatter: ({ value }) => formatoMoneda(value) },
];

export default function GastosPage() {
  return (
    <CrudPage
      title="Gastos"
      subtitle="Se restan de lo facturado para calcular la utilidad de los inversionistas"
      singular="Gasto"
      api={gastosApi}
      columns={columns}
      campos={campos}
      nuevoInicial={{ fecha: hoy(), categoria: "General", medio_pago: "efectivo" }}
    />
  );
}
