import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Chip, MenuItem, TextField } from "@mui/material";
import Header from "../../components/Header";
import DataTable from "../../components/DataTable";
import PeriodoFiltro from "../../components/PeriodoFiltro";
import useCarga from "../../hooks/useCarga";
import { facturasApi } from "../../api";
import { ESTADOS_FACTURA } from "../../utils/factura";
import { formatoFecha, formatoMoneda, inicioDeMes, hoy } from "../../utils/format";

const columns = [
  { field: "numero", headerName: "Número", width: 120 },
  { field: "fecha", headerName: "Fecha", width: 110, valueFormatter: ({ value }) => formatoFecha(value) },
  { field: "cliente_nombre", headerName: "Cliente", flex: 1, minWidth: 200 },
  { field: "forma_pago", headerName: "Pago", width: 100, valueFormatter: ({ value }) => (value === "credito" ? "Crédito" : "Contado") },
  {
    field: "estado", headerName: "Estado", width: 120,
    renderCell: ({ value }) => <Chip size="small" label={ESTADOS_FACTURA[value]?.label} color={ESTADOS_FACTURA[value]?.color} />,
  },
  { field: "total", headerName: "Total", width: 150, align: "right", headerAlign: "right", valueFormatter: ({ value }) => formatoMoneda(value), cellClassName: "tabular" },
];

export default function FacturasPage() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({ desde: inicioDeMes(), hasta: hoy(), estado: "" });
  const { data, cargando, error } = useCarga(() => facturasApi.listar(filtros), [filtros], []);

  const total = data.filter((f) => f.estado !== "anulada").reduce((a, f) => a + f.total, 0);

  return (
    <Box>
      <Header title="Facturas" subtitle={`${data.length} facturas · ${formatoMoneda(total)} sin anuladas`} />
      <Box mb={2}>
        <PeriodoFiltro value={filtros} onChange={setFiltros}>
          <TextField select size="small" label="Estado" sx={{ minWidth: 140 }} value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(ESTADOS_FACTURA).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
          </TextField>
        </PeriodoFiltro>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataTable
        rows={data}
        columns={columns}
        loading={cargando}
        onRowClick={({ row }) => navigate(`/facturas/${row.id}`)}
        sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
      />
    </Box>
  );
}
