/* eslint-disable react/prop-types */
import { Box, useTheme } from "@mui/material";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { tokens } from "../theme";

const Toolbar = () => (
  <Box p={1}>
    <GridToolbarQuickFilter placeholder="Buscar…" debounceMs={250} />
  </Box>
);

/** DataGrid con el estilo de la app, búsqueda rápida y textos en español. */
const DataTable = ({ height = "70vh", ...props }) => {
  const colors = tokens(useTheme().palette.mode);
  return (
    <Box
      height={height}
      sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
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
