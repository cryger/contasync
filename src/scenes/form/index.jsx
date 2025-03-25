import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, MenuItem, CircularProgress, Alert } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import api from '../../api/api';

const validationSchema = yup.object().shape({
  firstName: yup.string().required("Nombre es requerido"),
  lastName: yup.string().required("Apellido es requerido"),
  email: yup.string().email("Email inválido").required("Email es requerido"),
  password: yup.string().min(8, "Mínimo 8 caracteres").required("Contraseña es requerida"),
  roleId: yup.string().required("Rol es requerido"),
  contact: yup.string(),
  address1: yup.string(),
  address2: yup.string()
});

const Form = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Obtener roles al cargar el componente
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles');
        setRoles(response.data);
      } catch (err) {
        setError("Error al cargar roles");
        console.error("Error fetching roles:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoles();
  }, []);

  // Función para enviar el formulario
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError("");
      
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        roleId: values.roleId,
        contact: values.contact,
        address1: values.address1,
        address2: values.address2
      };

      const response = await api.post('/users', userData);
      
      console.log("Usuario creado:", response.data);
      resetForm();
      navigate("/success"); // Redirige a página de éxito
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                         "Error al crear usuario";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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
    {/* Elimina el componente Header */}
    <h1>CREATE USER</h1>
    <h2>Create a New User Profile</h2>
    
    {error && (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )}

      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          contact: "",
          address1: "",
          address2: "",
          roleId: ""
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting
        }) => (
          <form onSubmit={handleSubmit}>
            {/* Campos del formulario */}
            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Nombre"
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              error={touched.firstName && !!errors.firstName}
              helperText={touched.firstName && errors.firstName}
              sx={{ gridColumn: "span 2", mb: 2 }}
            />
            
            {/* Repite para los otros campos */}
            
            <TextField
              select
              fullWidth
              variant="filled"
              label="Rol"
              name="roleId"
              value={values.roleId}
              onChange={handleChange}
              error={touched.roleId && !!errors.roleId}
              helperText={touched.roleId && errors.roleId}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Seleccione un rol</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.nombre}
                </MenuItem>
              ))}
            </TextField>

            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Crear Usuario"}
            </Button>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;