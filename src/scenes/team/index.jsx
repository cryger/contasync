import { Box, Typography, useTheme, IconButton, Tooltip, CircularProgress, Alert } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  AdminPanelSettingsOutlined,
  LockOpenOutlined,
  SecurityOutlined,
  Edit,
  Delete
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import api from '../../api/api';
import { useNavigate } from "react-router-dom";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/usuarios');
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Eliminar usuario
  const handleDelete = async (userId) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await api.delete(`/usuarios/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
        setSuccess("Usuario eliminado exitosamente!");
        
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Error al eliminar usuario");
      }
    }
  };

  // Editar usuario
  const handleEdit = (userId) => {
    navigate(`/form?id=${userId}`);
  };

  // Función para determinar el icono y color según el rol
  const getAccessDetails = (rolNombre) => {
    switch(rolNombre) {
      case 'Administrador':
        return {
          icon: <AdminPanelSettingsOutlined />,
          color: colors.greenAccent[600],
          label: 'Administrador'
        };
      case 'Contable':
        return {
          icon: <SecurityOutlined />,
          color: colors.greenAccent[700],
          label: 'Contable'
        };
      case 'Inversionista':
        return {
          icon: <LockOpenOutlined />,
          color: colors.greenAccent[800],
          label: 'Inversionista'
        };
      default:
        return {
          icon: <LockOpenOutlined />,
          color: colors.greenAccent[900],
          label: 'Usuario'
        };
    }
  };

  // Columnas para DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "rol_nombre",
      headerName: "Rol",
      flex: 1,
      valueGetter: (params) => params.row.rol_nombre || "Usuario"
    },
    {
      field: "access",
      headerName: "Nivel de Acceso",
      flex: 1,
      renderCell: ({ row }) => {
        const accessDetails = getAccessDetails(row.rol_nombre);
        
        return (
          <Box
            width="140px"
            p={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            bgcolor={accessDetails.color}
            borderRadius={1}
          >
            {accessDetails.icon}
            <Typography textTransform="capitalize">
              {accessDetails.label}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 120,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Editar usuario">
            <IconButton 
              onClick={() => handleEdit(params.row.id)}
              sx={{ color: colors.greenAccent[300] }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar usuario">
            <IconButton 
              onClick={() => handleDelete(params.row.id)}
              sx={{ color: colors.redAccent[500] }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header 
        title="EQUIPO" 
        subtitle="Gestión de miembros del equipo" 
        addButton 
        addButtonText="Nuevo Usuario" 
        addButtonLink="/form" 
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}
      
      <Box
        mt="40px"
        height="75vh"
        flex={1}
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            border: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
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
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          checkboxSelection
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: "No hay usuarios registrados",
            footerRowSelected: (count) =>
              count !== 1
                ? `${count.toLocaleString()} usuarios seleccionados`
                : `${count.toLocaleString()} usuario seleccionado`,
          }}
        />
      </Box>
    </Box>
  );
};

export default Team;