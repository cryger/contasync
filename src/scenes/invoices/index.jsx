import { Box, Typography, useTheme, Button, IconButton, Stack } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [facturas, setFacturas] = useState([
    { id: 1, cliente: "Juan Pérez", nit: "123456789", fecha: "2024-05-01", total: 50000 },
    { id: 2, cliente: "Ana Gómez", nit: "987654321", fecha: "2024-05-02", total: 75000 },
  ]);

  const handleEditar = (id) => {
    const factura = facturas.find((f) => f.id === id);
    console.log("Editar factura:", factura);
    // Aquí podrías abrir un modal o redirigir a un formulario
  };

  const handleEliminar = (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar esta factura?");
    if (confirmacion) {
      setFacturas((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleCrearFactura = () => {
    console.log("Crear nueva factura");
    // Aquí podrías abrir un modal o redirigir a un formulario
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "cliente", headerName: "Cliente", flex: 1, minWidth: 150 },
    { field: "nit", headerName: "NIT", flex: 1, minWidth: 120 },
    { field: "fecha", headerName: "Fecha", flex: 1, minWidth: 120 },
    {
      field: "total",
      headerName: "Total",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Typography color={colors.greenAccent[500]}>
          ${params.row.total.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" onClick={() => handleEditar(params.row.id)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleEliminar(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="FACTURAS" subtitle="Gestión de facturación" />
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleCrearFactura}
        >
          Crear Factura
        </Button>
      </Box>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box
          sx={{
            minWidth: "1200px",
            height: "75vh",
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              border: "none",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-iconSeparator": {
              color: colors.primary[100],
            },
          }}
        >
          <DataGrid
            rows={facturas}
            columns={columns}
            checkboxSelection
            pageSize={10}
            autoHeight={false}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Invoices;
