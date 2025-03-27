import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, MenuItem, CircularProgress, Alert, Grid, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { Edit, Delete } from "@mui/icons-material";
import api from '../../api/api';

const validationSchema = yup.object().shape({
  nombre: yup.string().required("Nombre es requerido"),
  email: yup.string().email("Email inválido").required("Email es requerido"),
  contrasena: yup.string()
    .min(8, "Mínimo 8 caracteres")
    .required("Contraseña es requerida"),
  rol_id: yup.string().required("Debe seleccionar un rol")
});

const UserForm = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);

  const formik = useFormik({
    initialValues: {
      nombre: "",
      email: "",
      contrasena: "",
      rol_id: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setError("");
        setSuccess("");

        const userData = {
          nombre: values.nombre,
          email: values.email,
          rol_id: values.rol_id,
        };

        if (!editingUserId || values.contrasena) {
          userData.contrasena = values.contrasena;
        }

        if (editingUserId) {
          await api.put(`/usuarios/${editingUserId}`, userData);
          setSuccess("Usuario actualizado exitosamente!");
        } else {
          await api.post('/usuarios', userData);
          setSuccess("Usuario creado exitosamente!");
        }
        
        const { data } = await api.get('/usuarios');
        setUsers(data);
        resetForm();
        setEditingUserId(null);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Error al procesar la solicitud");
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const [rolesResponse, usersResponse] = await Promise.all([
          api.get('/roles'),
          api.get('/usuarios')
        ]);
        
        setRoles(rolesResponse.data);
        setUsers(usersResponse.data);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Editar usuario
  const handleEdit = (user) => {
    setEditingUserId(user.id);
    formik.setValues({
      nombre: user.nombre,
      email: user.email,
      contrasena: '',
      rol_id: user.rol_id.toString(),
    });
    // Desplazarse al formulario
    document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Eliminar usuario
  const handleDelete = async (userId) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await api.delete(`/usuarios/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
        setSuccess("Usuario eliminado exitosamente!");
      } catch (err) {
        setError(err.response?.data?.message || "Error al eliminar usuario");
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        Gestión de Usuarios
      </Typography>

      <Grid container spacing={3}>
        {/* Formulario */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} id="user-form">
            <Typography variant="h6" gutterBottom>
              {editingUserId ? `Editando Usuario ID: ${editingUserId}` : "Crear Nuevo Usuario"}
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    name="nombre"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                    helperText={formik.touched.nombre && formik.errors.nombre}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={editingUserId ? "Nueva Contraseña (opcional)" : "Contraseña"}
                    name="contrasena"
                    type="password"
                    value={formik.values.contrasena}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.contrasena && Boolean(formik.errors.contrasena)}
                    helperText={formik.touched.contrasena && formik.errors.contrasena}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Rol"
                    name="rol_id"
                    value={formik.values.rol_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.rol_id && Boolean(formik.errors.rol_id)}
                    helperText={formik.touched.rol_id && formik.errors.rol_id}
                  >
                    <MenuItem value="" disabled>
                      Seleccione un rol
                    </MenuItem>
                    {roles.map((role) => (
                      <MenuItem 
                        key={role.id} 
                        value={role.id}
                      >
                        {role.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : editingUserId ? (
                      "ACTUALIZAR USUARIO"
                    ) : (
                      "CREAR USUARIO"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Lista de usuarios */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, maxHeight: '70vh', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Lista de Usuarios ({users.length})
            </Typography>

            {users.length === 0 ? (
              <Alert severity="info">No hay usuarios registrados</Alert>
            ) : (
              <Grid container spacing={2}>
                {users.map((user) => (
                  <Grid item xs={12} key={user.id}>
                    <Paper sx={{ 
                      p: 2, 
                      position: 'relative',
                      border: editingUserId === user.id ? '2px solid #1976d2' : 'none',
                      backgroundColor: editingUserId === user.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                    }}>
                      <Typography variant="subtitle1">
                        {user.nombre} - {user.email}
                        {editingUserId === user.id && (
                          <span style={{ color: '#1976d2', marginLeft: '8px', fontSize: '0.8rem' }}>
                            (Editando)
                          </span>
                        )}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Rol:</strong> {roles.find(r => r.id === user.rol_id)?.nombre || 'Desconocido'}
                      </Typography>
                      
                      {/* Contenedor de botones - Editar y Eliminar */}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        display: 'flex',
                        gap: '8px'
                      }}>
                        {/* Botón de Editar */}
                        <Tooltip title="Editar usuario">
                          <IconButton 
                            color={editingUserId === user.id ? "secondary" : "primary"}
                            onClick={() => handleEdit(user)}
                            size="small"
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.1)'
                              }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Botón de Eliminar */}
                        <Tooltip title="Eliminar usuario">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(user.id)}
                            size="small"
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)'
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Mensajes de feedback */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default UserForm;