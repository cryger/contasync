import { useState, useEffect } from "react";
import axios from "axios";

const Bancos = () => {
  const [bancos, setBancos] = useState([]);
  const [nuevoBanco, setNuevoBanco] = useState({
    nombre: "",
    pais: "",
    ciudad: ""
  });
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerBancos();
  }, []);

  const obtenerBancos = async () => {
    try {
      setCargando(true);
      const response = await axios.get("http://localhost:5000/api/bancos");
      setBancos(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener bancos:", err);
      setError("Error al cargar los bancos. Intente nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoBanco({
      ...nuevoBanco,
      [name]: value
    });
  };

  const limpiarFormulario = () => {
    setNuevoBanco({
      nombre: "",
      pais: "",
      ciudad: ""
    });
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await axios.put(`http://localhost:5000/api/bancos/${editandoId}`, nuevoBanco);
      } else {
        await axios.post("http://localhost:5000/api/bancos", nuevoBanco);
      }
      obtenerBancos();
      limpiarFormulario();
    } catch (err) {
      console.error("Error al guardar el banco:", err);
      setError(err.response?.data?.message || "Error al guardar el banco");
    }
  };

  const editarBanco = (banco) => {
    setNuevoBanco({
      nombre: banco.nombre,
      pais: banco.pais,
      ciudad: banco.ciudad
    });
    setEditandoId(banco.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarBanco = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este banco?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/bancos/${id}`);
      setBancos(bancos.filter(banco => banco.id !== id));
    } catch (err) {
      console.error("Error al eliminar el banco:", err);
      setError("Error al eliminar el banco");
    }
  };

  const styles = {
    container: {
      padding: "20px",
      color: "white",
      maxWidth: "1200px",
      margin: "0 auto"
    },
    form: {
      marginBottom: "30px",
      backgroundColor: "#2c2c2e",
      padding: "20px",
      borderRadius: "8px"
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
      fontWeight: "bold"
    },
    input: {
      width: "100%",
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #444",
      backgroundColor: "#1c1c1e",
      color: "white"
    },
    button: {
      padding: "8px 15px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      marginRight: "10px"
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
      border: "1px solid #444"
    },
    tableHeader: {
      backgroundColor: "#1f1f1f",
      color: "#e0e0e0",
      fontWeight: "bold",
      textTransform: "uppercase",
      textAlign: "center",
      padding: "12px"
    },
    tableRow: {
      borderBottom: "1px solid #444"
    },
    tableCell: {
      padding: "12px 15px",
      textAlign: "center"
    },
    loading: {
      textAlign: "center",
      padding: "20px"
    },
    error: {
      color: "#dc3545",
      marginBottom: "15px",
      padding: "10px",
      backgroundColor: "#f8d7da",
      borderRadius: "4px",
      border: "1px solid #f5c6cb"
    }
  };

  return (
    <div style={styles.container}>
      <h1>{editandoId ? "Editar Banco" : "Registrar Nuevo Banco"}</h1>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre del Banco:</label>
            <input
              type="text"
              name="nombre"
              value={nuevoBanco.nombre}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Ej: Banco Nacional"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>País:</label>
            <input
              type="text"
              name="pais"
              value={nuevoBanco.pais}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Ej: Colombia"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Ciudad:</label>
            <input
              type="text"
              name="ciudad"
              value={nuevoBanco.ciudad}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ej: Bogotá"
            />
          </div>
        </div>

        <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
          {editandoId ? "Actualizar Banco" : "Registrar Banco"}
        </button>

        {editandoId && (
          <button type="button" onClick={limpiarFormulario} style={{ ...styles.button, ...styles.secondaryButton }}>
            Cancelar
          </button>
        )}
      </form>

      <h2>Listado de Bancos</h2>

      {cargando ? (
        <div style={styles.loading}>Cargando bancos...</div>
      ) : bancos.length === 0 ? (
        <p>No hay bancos registrados</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>ID</th>
                <th style={styles.tableHeader}>Nombre</th>
                <th style={styles.tableHeader}>País</th>
                <th style={styles.tableHeader}>Ciudad</th>
                <th style={styles.tableHeader}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bancos.map((banco) => (
                <tr key={banco.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{banco.id}</td>
                  <td style={styles.tableCell}>{banco.nombre}</td>
                  <td style={styles.tableCell}>{banco.pais}</td>
                  <td style={styles.tableCell}>{banco.ciudad || "-"}</td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => editarBanco(banco)}
                      style={{ ...styles.button, ...styles.secondaryButton, marginRight: "5px" }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarBanco(banco.id)}
                      style={{ ...styles.button, ...styles.dangerButton }}
                    >
                      Eliminar
                    </button>
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

export default Bancos;
