import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, MenuItem, CircularProgress, Alert, Grid, Paper, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        
        // Cargar roles disponibles
        const rolesResponse = await api.get('/roles');
        setRoles(rolesResponse.data);
        
        if (userId) {
          // Si hay ID, estamos editando - cargar datos del usuario
          const userResponse = await api.get(`/usuarios/${userId}`);
          const user = userResponse.data;
          setEditingUserId(user.id);
          formik.setValues({
            nombre: user.nombre,
            email: user.email,
            contrasena: '',
            rol_id: user.rol_id.toString(),
          });
        } else {
          // Si no hay ID, estamos creando - limpiar formulario
          formik.resetForm();
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
          setSuccess("Usuario actualizado exitosamente! Redirigiendo...");
        } else {
          await api.post('/usuarios', userData);
          setSuccess("Usuario creado exitosamente! Redirigiendo...");
          resetForm(); // Limpiar formulario después de crear
        }
        
        setTimeout(() => {
          window.location.href = '/team';
        }, 1500);
        
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Error al procesar la solicitud");
      } finally {
        setSubmitting(false);
      }
    }
  });

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
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }} id="user-form">
            <Typography variant="h6" gutterBottom>
              {editingUserId ? `Editando Usuario ID: ${editingUserId}` : "Crear Nuevo Usuario"}
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={6}>
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
                      <MenuItem key={role.id} value={role.id}>
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
                    sx={{ mt: 2 }}
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
      </Grid>

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