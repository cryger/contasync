/* eslint-disable react/prop-types */
import { Box } from "@mui/material";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useColors } from "../theme";
import { contraste } from "../utils/color";

const Toolbar = () => (
  <Box p={1}>
    <GridToolbarQuickFilter placeholder="Buscar…" debounceMs={250} />
  </Box>
);

/** DataGrid con el estilo de la app, búsqueda rápida y textos en español. */
const DataTable = ({ height = "70vh", ...props }) => {
  const colors = useColors();
  const encabezado = colors.secundario[600];
  const textoEncabezado = contraste(encabezado);
  return (
    <Box
      height={height}
      sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: encabezado, color: textoEncabezado, borderBottom: "none" },
        "& .MuiDataGrid-columnHeaders .MuiSvgIcon-root, & .MuiDataGrid-columnHeaders .MuiButtonBase-root": { color: textoEncabezado },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.base[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: encabezado },
        "& .MuiDataGrid-footerContainer, & .MuiDataGrid-footerContainer .MuiTablePagination-root, & .MuiDataGrid-footerContainer .MuiSvgIcon-root": { color: textoEncabezado },
        "& .MuiDataGrid-toolbarContainer, & .MuiDataGrid-toolbarContainer + div": {},
      }}
    >
      <DataGrid
        disableRowSelectionOnClick
        slots={{ toolbar: Toolbar }}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        pageSizeOptions={[25, 50, 100]}
        localeText={{
          noRowsLabel: "Sin registros",
          MuiTablePagination: { labelRowsPerPage: "Filas por página" },
        }}
        {...props}
      />
    </Box>
  );
};

export default DataTable;
