import { useState, useEffect } from "react";
import axios from "axios";

const Employees = () => {
  // Estados para manejar los datos
  const [empleados, setEmpleados] = useState([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    identificacion: "",
    cargo: "",
    salario: "",
    fecha_contratacion: ""
  });
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    if (!valor) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Función para parsear moneda
  const parsearMoneda = (valorFormateado) => {
    if (!valorFormateado) return "";
    return valorFormateado.replace(/[^\d]/g, "");
  };

  // Obtener los empleados al cargar el componente
  useEffect(() => {
    obtenerEmpleados();
  }, []);

  // Función para obtener todos los empleados
  const obtenerEmpleados = async () => {
    try {
      setCargando(true);
      const response = await axios.get("http://localhost:5000/api/empleados");
      setEmpleados(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener empleados:", err);
      setError("Error al cargar los empleados. Intente nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "salario") {
      const valorNumerico = parsearMoneda(value);
      setNuevoEmpleado({
        ...nuevoEmpleado,
        [name]: valorNumerico
      });
    } else {
      setNuevoEmpleado({ ...nuevoEmpleado, [name]: value });
    }
  };

  // Limpiar el formulario
  const limpiarFormulario = () => {
    setNuevoEmpleado({
      nombre: "",
      identificacion: "",
      cargo: "",
      salario: "",
      fecha_contratacion: ""
    });
    setEditandoId(null);
  };

  // Crear o actualizar un empleado
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const datos = {
        ...nuevoEmpleado,
        salario: parseFloat(nuevoEmpleado.salario)
      };

      if (editandoId) {
        await axios.put(`http://localhost:5000/api/empleados/${editandoId}`, datos);
      } else {
        await axios.post("http://localhost:5000/api/empleados", datos);
      }

      obtenerEmpleados();
      limpiarFormulario();
    } catch (err) {
      console.error("Error al guardar el empleado:", err);
      setError(err.response?.data?.message || "Error al guardar el empleado");
    }
  };

  // Editar un empleado existente
  const editarEmpleado = (empleado) => {
    setNuevoEmpleado({
      nombre: empleado.nombre,
      identificacion: empleado.identificacion,
      cargo: empleado.cargo,
      salario: empleado.salario.toString(),
      fecha_contratacion: empleado.fecha_contratacion
    });
    setEditandoId(empleado.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Eliminar un empleado
  const eliminarEmpleado = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este empleado?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/empleados/${id}`);
      setEmpleados(empleados.filter(empleado => empleado.id !== id));
    } catch (err) {
      console.error("Error al eliminar el empleado:", err);
      setError("Error al eliminar el empleado");
    }
  };

  // Estilos CSS mejorados para encabezado y tabla
  const styles = {
    container: {
      padding: "20px",
      color: "white",
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#121212",
      borderRadius: "8px"
    },
    form: {
      marginBottom: "30px",
      backgroundColor: "#2c2c2e",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "15px",
      marginBottom: "15px"
    },
    inputGroup: {
      marginBottom: "10px"
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "600",
      fontSize: "0.9rem",
      color: "#ddd"
    },
    input: {
      width: "100%",
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #444",
      backgroundColor: "#1c1c1e",
      color: "white",
      fontSize: "1rem"
    },
    button: {
      padding: "8px 15px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      marginRight: "10px",
      fontWeight: "600",
      fontSize: "0.95rem",
      transition: "background-color 0.3s ease"
    },
    primaryButton: {
      backgroundColor: "#007bff",
      color: "white"
    },
    dangerButton: {
      backgroundColor: "#dc3545",
      color: "white"
    },
    secondaryButton: {
      backgroundColor: "#6c757d",
      color: "white"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
      fontSize: "0.95rem",
      boxShadow: "0 2px 10px rgba(0,0,0,0.5)"
    },
    tableHeader: {
      backgroundColor: "#007bff",
      color: "white",
      textTransform: "uppercase",
      fontWeight: "700",
      padding: "12px 15px",
      textAlign: "left",
      borderBottom: "2px solid #0056b3",
      userSelect: "none"
    },
    tableRow: {
      borderBottom: "1px solid #444",
      backgroundColor: "#1e1e1e"
    },
    tableRowAlt: {
      backgroundColor: "#2a2a2a"
    },
    tableCell: {
      padding: "12px 15px",
      color: "#ddd"
    },
    tableCellRight: {
      padding: "12px 15px",
      color: "#ddd",
      textAlign: "right",
      fontVariantNumeric: "tabular-nums"
    },
    loading: {
      textAlign: "center",
      padding: "20px",
      fontSize: "1.1rem",
      color: "#aaa"
    },
    error: {
      color: "#dc3545",
      marginBottom: "15px",
      padding: "10px",
      backgroundColor: "#f8d7da",
      borderRadius: "4px",
      border: "1px solid #f5c6cb",
      fontWeight: "600"
    },
    actionButtonsContainer: {
      display: "flex",
      gap: "8px",
      justifyContent: "flex-start"
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: "center", marginBottom: "25px", fontWeight: "700", color: "#007bff", textTransform: "uppercase" }}>
        {editandoId ? "Editar Empleado" : "Registrar Nuevo Empleado"}
      </h1>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre Completo:</label>
            <input
              type="text"
              name="nombre"
              value={nuevoEmpleado.nombre}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Identificación:</label>
            <input
              type="text"
              name="identificacion"
              value={nuevoEmpleado.identificacion}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Ej: 1234567890"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Cargo:</label>
            <input
              type="text"
              name="cargo"
              value={nuevoEmpleado.cargo}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ej: Desarrollador"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Salario:</label>
            <input
              type="text"
              name="salario"
              value={formatearMoneda(nuevoEmpleado.salario)}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Ej: $2,000,000"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Fecha de Contratación:</label>
            <input
              type="date"
              name="fecha_contratacion"
              value={nuevoEmpleado.fecha_contratacion}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          {editandoId ? "Actualizar Empleado" : "Registrar Empleado"}
        </button>

        {editandoId && (
          <button
            type="button"
            onClick={limpiarFormulario}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Cancelar
          </button>
        )}
      </form>

      <h2 style={{ color: "#007bff", borderBottom: "2px solid #007bff", paddingBottom: "5px", marginBottom: "15px", fontWeight: "700" }}>
        Listado de Empleados
      </h2>

      {cargando ? (
        <div style={styles.loading}>Cargando empleados...</div>
      ) : empleados.length === 0 ? (
        <p>No hay empleados registrados</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.tableHeader, textAlign: "right" }}>ID</th>
                <th style={styles.tableHeader}>Nombre</th>
                <th style={styles.tableHeader}>Identificación</th>
                <th style={styles.tableHeader}>Cargo</th>
                <th style={{ ...styles.tableHeader, textAlign: "right" }}>Salario</th>
                <th style={{ ...styles.tableHeader, textAlign: "right" }}>Fecha Contratación</th>
                <th style={styles.tableHeader}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((empleado, index) => (
                <tr
                  key={empleado.id}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <td style={styles.tableCellRight}>{empleado.id}</td>
                  <td style={styles.tableCell}>{empleado.nombre}</td>
                  <td style={styles.tableCell}>{empleado.identificacion}</td>
                  <td style={styles.tableCell}>{empleado.cargo}</td>
                  <td style={styles.tableCellRight}>{formatearMoneda(empleado.salario)}</td>
                  <td style={styles.tableCellRight}>{empleado.fecha_contratacion}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtonsContainer}>
                      <button
                        style={{ ...styles.button, ...styles.primaryButton }}
                        onClick={() => editarEmpleado(empleado)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        style={{ ...styles.button, ...styles.dangerButton }}
                        onClick={() => eliminarEmpleado(empleado.id)}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Employees;
