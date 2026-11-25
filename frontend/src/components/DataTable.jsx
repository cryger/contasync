/* eslint-disable react/prop-types */
import { useCallback, useDeferredValue, useState } from "react";
import { Box, InputAdornment, TablePagination, TextField, Typography } from "@mui/material";
import { DataGrid, gridExpandedRowCountSelector, useGridApiRef } from "@mui/x-data-grid";
import { InboxOutlined, SearchOutlined } from "@mui/icons-material";
import { useColors } from "../theme";

/** Estado vacío con mensaje útil (en lugar de un espacio en blanco) */
const SinFilas = ({ mensaje }) => {
  const colors = useColors();
  return (
    <Box height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={1} p={3} textAlign="center">
      <Box width={48} height={48} borderRadius="12px" display="flex" alignItems="center" justifyContent="center"
        bgcolor={colors.base[600]} color={colors.textoSuave} aria-hidden>
        <InboxOutlined />
      </Box>
      <Typography fontWeight={600}>{mensaje?.titulo || "Todavía no hay registros"}</Typography>
      {mensaje?.detalle && <Typography variant="body2" color={colors.textoSuave} maxWidth={360}>{mensaje.detalle}</Typography>}
    </Box>
  );
};

/**
 * DataGrid con el estilo del sistema (superficie con borde, encabezado neutro, filas con hover),
 * búsqueda rápida, estado vacío y textos en español.
 * vacio: { titulo, detalle } para el estado sin registros.
 */
const DataTable = ({ height = "70vh", vacio, sx, ...props }) => {
  const colors = useColors();
  const encabezado = colors.base[500];
  // El buscador va FUERA de la grilla (dentro rompe la estructura role="grid" para lectores de pantalla)
  const [busqueda, setBusqueda] = useState("");
  const termino = useDeferredValue(busqueda);
  // El paginador también va fuera: dentro de role="grid" su selector y botones rompen la estructura accesible
  const apiRef = useGridApiRef();
  const [pagina, setPagina] = useState({ page: 0, pageSize: 25 });
  const [total, setTotal] = useState(0);
  const alCambiarEstado = useCallback(() => {
    const n = gridExpandedRowCountSelector(apiRef);
    setTotal((prev) => (prev === n ? prev : n));
  }, [apiRef]);
  return (
    <Box>
    <TextField
      size="small"
      placeholder="Buscar…"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      inputProps={{ "aria-label": "Buscar en la tabla" }}
      InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" aria-hidden /></InputAdornment> }}
      sx={{ mb: 1.5, width: { xs: "100%", sm: 320 } }}
    />
    <Box
      height={height}
      minHeight={360}
      bgcolor={colors.superficie}
      border={`1px solid ${colors.borde}`}
      borderRadius="12px"
      overflow="hidden"
      sx={{
        "& .MuiDataGrid-root": { border: "none", fontSize: 14, "--DataGrid-rowBorderColor": colors.borde },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: encabezado, borderBottom: `1px solid ${colors.borde}`, borderRadius: 0 },
        "& .MuiDataGrid-columnHeaderTitle": {
          color: colors.textoSuave, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em",
        },
        "& .MuiDataGrid-cell": { borderColor: colors.borde },
        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": { outline: `2px solid ${colors.foco}`, outlineOffset: -2 },
        "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within": { outline: "none" },
        "& .MuiDataGrid-row": { transition: "background-color 150ms ease" },
        "& .MuiDataGrid-row:hover": { backgroundColor: colors.acentoSuave },
        "& .MuiDataGrid-withBorderColor": { borderColor: colors.borde },
        ...sx,
      }}
    >
      <DataGrid
        disableRowSelectionOnClick
        rowHeight={52}
        columnHeaderHeight={44}
        filterModel={{ items: [], quickFilterValues: termino.split(" ").filter(Boolean) }}
        slots={{ noRowsOverlay: () => <SinFilas mensaje={vacio} />, noResultsOverlay: () => <SinFilas mensaje={{ titulo: "Sin resultados", detalle: "Prueba con otra búsqueda." }} /> }}
        apiRef={apiRef}
        onStateChange={alCambiarEstado}
        paginationModel={pagina}
        onPaginationModelChange={setPagina}
        pageSizeOptions={[25, 50, 100]}
        hideFooter
        localeText={{
          noRowsLabel: "Sin registros",
          toolbarQuickFilterPlaceholder: "Buscar…",
        }}
        {...props}
      />
    </Box>
    <TablePagination
      component="div"
      count={total}
      page={Math.min(pagina.page, Math.max(0, Math.ceil(total / pagina.pageSize) - 1))}
      rowsPerPage={pagina.pageSize}
      rowsPerPageOptions={[25, 50, 100]}
      onPageChange={(_, page) => setPagina((p) => ({ ...p, page }))}
      onRowsPerPageChange={(e) => setPagina({ page: 0, pageSize: Number(e.target.value) })}
      labelRowsPerPage="Filas por página"
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      getItemAriaLabel={(tipo) => ({ first: "Primera página", last: "Última página", next: "Página siguiente", previous: "Página anterior" }[tipo])}
      sx={{ color: colors.textoSuave }}
    />
    </Box>
  );
};

export default DataTable;
