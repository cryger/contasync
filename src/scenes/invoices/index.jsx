import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  Button,
  Modal,
  TextField,
  FormControl,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Estados del componente
  const [invoices, setInvoices] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState({
    id: null,
    ingreso_id: "",
    gasto_id: "",
    fecha: new Date().toISOString().split('T')[0],
    monto: ""
  });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Configuración de la API
  const API_URL = "http://localhost:5000/api/facturas"; // Ajusta esta URL

  // Columnas para la DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "ingreso_id", headerName: "Ingreso ID", width: 100 },
    { field: "gasto_id", headerName: "Gasto ID", width: 100 },
    {
      field: "fecha",
      headerName: "Fecha",
      width: 120,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ""
    },
    {
      field: "monto",
      headerName: "Monto",
      width: 120,
      renderCell: (params) => (
        <Typography color={colors.greenAccent[500]}>
          ${params.row.monto ? parseFloat(params.row.monto).toFixed(2) : "0.00"}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 120,
      renderCell: (params) => (
        <div>
          <IconButton
            onClick={() => handleEdit(params.row)}
            sx={{ color: colors.blueAccent[400] }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            sx={{ color: colors.redAccent[500] }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )
    }
  ];

  // Efecto para cargar las facturas
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setInvoices(response.data);
    } catch (err) {
      setError("Error al cargar facturas");
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setIsEdit(false);
    setCurrentInvoice({
      id: null,
      ingreso_id: "",
      gasto_id: "",
      fecha: new Date().toISOString().split('T')[0],
      monto: ""
    });
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isEdit) {
        await axios.put(`${API_URL}/${currentInvoice.id}`, currentInvoice);
        showSnackbar("Factura actualizada", "success");
      } else {
        await axios.post(API_URL, currentInvoice);
        showSnackbar("Factura creada", "success");
      }
      
      await fetchInvoices();
      handleCloseModal();
    } catch (err) {
      showSnackbar("Error al guardar", "error");
      console.error("Error saving invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (invoice) => {
    setCurrentInvoice({
      ...invoice,
      fecha: invoice.fecha ? invoice.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsEdit(true);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`);
      showSnackbar("Factura eliminada", "success");
      await fetchInvoices();
    } catch (err) {
      showSnackbar("Error al eliminar", "error");
      console.error("Error deleting invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box m="20px">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Header
        title="FACTURAS"
        subtitle="Facturas de Balance de Caja"
        rightContent={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            disabled={loading}
            sx={{
              backgroundColor: colors.blueAccent[600],
              "&:hover": { backgroundColor: colors.blueAccent[700] }
            }}
          >
            Nueva Factura
          </Button>
        }
      />
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none"
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400]
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700]
          }
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={invoices}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } }
            }}
            loading={loading}
          />
        )}
      </Box>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1
          }}
        >
          <Typography variant="h6" mb={3}>
            {isEdit ? "Editar Factura" : "Nueva Factura"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Ingreso ID"
                name="ingreso_id"
                value={currentInvoice.ingreso_id}
                onChange={handleInputChange}
                required
                type="number"
                disabled={loading}
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Gasto ID"
                name="gasto_id"
                value={currentInvoice.gasto_id}
                onChange={handleInputChange}
                required
                type="number"
                disabled={loading}
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Fecha"
                type="date"
                name="fecha"
                value={currentInvoice.fecha}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Monto"
                type="number"
                name="monto"
                value={currentInvoice.monto}
                onChange={handleInputChange}
                required
                inputProps={{ step: "0.01", min: "0" }}
                disabled={loading}
              />
            </FormControl>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                onClick={handleCloseModal}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : isEdit ? "Actualizar" : "Guardar"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default Invoices;